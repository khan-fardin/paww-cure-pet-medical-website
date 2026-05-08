import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth/jwt";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { Pet } from "@/lib/db/models/Pet";
import { VetProfile } from "@/lib/db/models/VetProfile";

const bookConsultationSchema = z.object({
  vetId: z.string().min(1),
  petId: z.string().min(1),
  type: z.enum(["video", "audio", "chat", "in-clinic"]),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional(),
});

// TODO: Implement real payment processing
// TODO: Add email notifications for booking confirmation
// TODO: Implement slot availability checking
// TODO: Add cancellation policy

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    await dbConnect();

    let query: any = {};

    if (payload.role === "owner") {
      query.ownerId = payload.userId;
    } else if (payload.role === "vet") {
      query.vetId = payload.userId;
    } else if (payload.role === "admin" || payload.role === "mod") {
      // Admin/mod can view all, but might want to filter
    }

    const consultations = await Consultation.find(query)
      .select("-__v")
      .populate("petId", "name species breed")
      .populate("vetId", "name email")
      .populate("ownerId", "name email")
      .sort({ scheduledAt: -1 });

    return NextResponse.json({
      success: true,
      data: consultations,
    });
  } catch (error) {
    console.error("[consultations] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch consultations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (payload.role !== "owner") {
      return NextResponse.json(
        { success: false, message: "Only pet owners can book consultations" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = bookConsultationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify pet ownership
    const pet = await Pet.findById(parsed.data.petId);
    if (!pet || pet.ownerId.toString() !== payload.userId) {
      return NextResponse.json(
        { success: false, message: "Pet not found or not yours" },
        { status: 404 }
      );
    }

    // Verify vet exists and is verified
    const vet = await VetProfile.findById(parsed.data.vetId);
    if (!vet || !vet.isVerified || !vet.isActive) {
      return NextResponse.json(
        { success: false, message: "Vet not available" },
        { status: 404 }
      );
    }

    // TODO: Check slot availability
    // TODO: Process payment

    const consultation = await Consultation.create({
      ownerId: payload.userId,
      vetId: vet.userId,
      petId: parsed.data.petId,
      type: parsed.data.type,
      scheduledAt: new Date(parsed.data.scheduledAt),
      notes: parsed.data.notes,
      fees: {
        consultationFee: vet.consultationFee,
        total: vet.consultationFee,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Consultation booked successfully",
        data: consultation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[consultations] POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to book consultation" },
      { status: 500 }
    );
  }
}
