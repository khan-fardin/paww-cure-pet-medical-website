import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Booking } from "@/lib/db/models/Booking";
import { Consultation } from "@/lib/db/models/Consultation";
import { Payment } from "@/lib/db/models/Payment";
import { Pet } from "@/lib/db/models/Pet";
import { User } from "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";
import {
  getAppUrl,
  initiateSslCommerzPayment,
} from "@/lib/services/sslcommerz.service";
import { buildAvailabilitySlots } from "@/lib/utils/availability";

const createBookingSchema = z.object({
  notes: z.string().optional(),
  petId: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid pet",
  }),
  scheduledAt: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      message: "Invalid schedule",
    }),
  type: z.enum(["video", "audio", "chat", "in-clinic"]).default("video"),
  vetId: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid vet",
  }),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (session.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Only users can book consultations" },
        { status: 403 }
      );
    }

    const parsed = createBookingSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await dbConnect();

    const [user, pet, vetProfile] = await Promise.all([
      User.findById(session.userId).select("name email phone"),
      Pet.findOne({
        _id: parsed.data.petId,
        isActive: true,
        userId: session.userId,
      }),
      VetProfile.findOne({
        _id: parsed.data.vetId,
        acceptingNewPatients: true,
        isActive: true,
        isVerified: true,
      }).populate("userId", "name email"),
    ]);

    if (!user || !pet) {
      return NextResponse.json(
        { success: false, message: "User or pet not found" },
        { status: 404 }
      );
    }

    if (!vetProfile) {
      return NextResponse.json(
        { success: false, message: "Vet not available" },
        { status: 404 }
      );
    }

    const populatedVetUser = vetProfile.userId as
      | mongoose.Types.ObjectId
      | { _id: mongoose.Types.ObjectId };
    const vetUserId = new mongoose.Types.ObjectId(
      populatedVetUser instanceof mongoose.Types.ObjectId
        ? populatedVetUser.toString()
        : populatedVetUser._id.toString()
    );

    if (!parsed.data.scheduledAt) {
      return NextResponse.json(
        { success: false, message: "Please select an available slot" },
        { status: 400 }
      );
    }

    const scheduledAt = new Date(parsed.data.scheduledAt);
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 15);
    const [blockedBookings, blockedConsultations] = await Promise.all([
      Booking.find({
        scheduledAt: { $gte: new Date(), $lt: horizon },
        status: { $in: ["pending_payment", "confirmed"] },
        vetId: vetUserId,
      })
        .select("scheduledAt")
        .lean<{ scheduledAt: Date }[]>(),
      Consultation.find({
        scheduledAt: { $gte: new Date(), $lt: horizon },
        status: { $in: ["scheduled", "ongoing"] },
        vetId: vetUserId,
      })
        .select("scheduledAt")
        .lean<{ scheduledAt: Date }[]>(),
    ]);
    const blockedStarts = new Set(
      [...blockedBookings, ...blockedConsultations].map((item) =>
        new Date(item.scheduledAt).toISOString()
      )
    );
    const validSlots = buildAvailabilitySlots({
      blockedStarts,
      durationMinutes: vetProfile.consultationDuration,
      weeklyAvailability: vetProfile.availability ?? [],
    });

    if (!validSlots.some((slot) => slot.start === scheduledAt.toISOString())) {
      return NextResponse.json(
        { success: false, message: "Selected slot is no longer available" },
        { status: 409 }
      );
    }

    const platformFee = Math.round(vetProfile.consultationFee * 0.12);
    const amount = vetProfile.consultationFee + platformFee;
    const tranId = `paww_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const appUrl = getAppUrl();

    const booking = await Booking.create({
      amount,
      currency: "BDT",
      notes: parsed.data.notes,
      petId: pet._id,
      scheduledAt,
      status: "pending_payment",
      type: parsed.data.type,
      userId: user._id,
      vetId: vetUserId,
      vetProfileId: vetProfile._id,
    });

    const payment = await Payment.create({
      amount,
      bookingId: booking._id,
      currency: "BDT",
      gateway: "sslcommerz",
      petId: pet._id,
      status: "pending",
      tranId,
      userId: user._id,
      vetId: vetUserId,
    });

    booking.paymentId = payment._id;
    await booking.save();

    const sslResponse = await initiateSslCommerzPayment({
      amount,
      cancelUrl: `${appUrl}/api/payments/sslcommerz/cancel`,
      customer: {
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
      failUrl: `${appUrl}/api/payments/sslcommerz/fail`,
      productName: `pawwcure consultation for ${pet.name}`,
      successUrl: `${appUrl}/api/payments/sslcommerz/success`,
      tranId,
    });

    payment.gatewaySessionKey = sslResponse.sessionKey;
    payment.rawPayload = sslResponse.raw;
    await payment.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          bookingId: booking._id.toString(),
          paymentUrl: sslResponse.gatewayPageUrl,
          tranId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[bookings] POST error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to initiate booking payment",
      },
      { status: 500 }
    );
  }
}
