import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Booking } from "@/lib/db/models/Booking";
import { Consultation } from "@/lib/db/models/Consultation";
import { VetProfile } from "@/lib/db/models/VetProfile";
import { buildAvailabilitySlots } from "@/lib/utils/availability";

const availabilityItemSchema = z.object({
  day: z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const updateAvailabilitySchema = z.object({
  availability: z.array(availabilityItemSchema).max(28),
});

async function getBlockedStarts(vetId: mongoose.Types.ObjectId) {
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + 15);

  const [bookings, consultations] = await Promise.all([
    Booking.find({
      scheduledAt: { $gte: now, $lt: horizon },
      status: { $in: ["pending_payment", "confirmed"] },
      vetId,
    })
      .select("scheduledAt")
      .lean<{ scheduledAt: Date }[]>(),
    Consultation.find({
      scheduledAt: { $gte: now, $lt: horizon },
      status: { $in: ["scheduled", "ongoing"] },
      vetId,
    })
      .select("scheduledAt")
      .lean<{ scheduledAt: Date }[]>(),
  ]);

  return new Set(
    [...bookings, ...consultations].map((item) =>
      new Date(item.scheduledAt).toISOString()
    )
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid vet ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const vet = await VetProfile.findOne({
      _id: id,
      acceptingNewPatients: true,
      isActive: true,
      isVerified: true,
    }).lean<{
      availability: {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        endTime: string;
        startTime: string;
      }[];
      consultationDuration: number;
      userId: mongoose.Types.ObjectId;
    }>();

    if (!vet) {
      return NextResponse.json(
        { success: false, message: "Vet not available" },
        { status: 404 }
      );
    }

    const blockedStarts = await getBlockedStarts(vet.userId);
    const slots = buildAvailabilitySlots({
      blockedStarts,
      durationMinutes: vet.consultationDuration,
      weeklyAvailability: vet.availability ?? [],
    });

    return NextResponse.json({
      success: true,
      data: {
        availability: vet.availability ?? [],
        duration: vet.consultationDuration,
        slots,
      },
    });
  } catch (error) {
    console.error("[vet-availability] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load availability" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (session.role !== "vet") {
      return NextResponse.json(
        { success: false, message: "Only vets can update availability" },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid vet ID" },
        { status: 400 }
      );
    }

    const parsed = updateAvailabilitySchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await dbConnect();

    const vet = await VetProfile.findOne({ _id: id, userId: session.userId });

    if (!vet) {
      return NextResponse.json(
        { success: false, message: "Vet profile not found" },
        { status: 404 }
      );
    }

    vet.availability = parsed.data.availability;
    await vet.save();

    return NextResponse.json({
      success: true,
      data: vet.availability,
      message: "Availability updated",
    });
  } catch (error) {
    console.error("[vet-availability] PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update availability" },
      { status: 500 }
    );
  }
}
