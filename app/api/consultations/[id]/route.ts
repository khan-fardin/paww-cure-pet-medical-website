import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth/jwt";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { Prescription } from "@/lib/db/models/Prescription";
import mongoose from "mongoose";

const updateConsultationSchema = z.object({
  status: z
    .enum(["scheduled", "ongoing", "completed", "cancelled", "no-show"])
    .optional(),
  diagnosis: z.string().optional(),
  treatmentPlan: z.string().optional(),
  notes: z.string().optional(),
});

// TODO: Generate video/audio conference links when status = "ongoing"
// TODO: Auto-send follow-up notifications after completion
// TODO: Implement consultation recording and transcription

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid consultation ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const consultation = await Consultation.findById(id)
      .select("-__v")
      .populate("petId", "name species breed")
      .populate("vetId", "name email avatar")
      .populate("ownerId", "name email");

    if (!consultation) {
      return NextResponse.json(
        { success: false, message: "Consultation not found" },
        { status: 404 }
      );
    }

    // Check access (owner, vet, admin, or mod)
    const isOwner = consultation.ownerId._id?.toString() === payload.userId;
    const isVet = consultation.vetId._id?.toString() === payload.userId;
    const isAdmin = payload.role === "admin" || payload.role === "mod";

    if (!isOwner && !isVet && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Fetch related prescription if exists
    const prescription = await Prescription.findOne({
      consultationId: id,
    }).select("-__v");

    return NextResponse.json({
      success: true,
      data: {
        ...consultation.toObject(),
        prescription,
      },
    });
  } catch (error) {
    console.error("[consultations/id] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch consultation" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (payload.role !== "vet") {
      return NextResponse.json(
        { success: false, message: "Only vets can update consultations" },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid consultation ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = updateConsultationSchema.safeParse(body);

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

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return NextResponse.json(
        { success: false, message: "Consultation not found" },
        { status: 404 }
      );
    }

    // Verify vet is the one assigned to this consultation
    if (consultation.vetId.toString() !== payload.userId) {
      return NextResponse.json(
        { success: false, message: "You are not assigned to this consultation" },
        { status: 403 }
      );
    }

    // Update fields
    if (parsed.data.status) {
      consultation.status = parsed.data.status;
      if (parsed.data.status === "ongoing") {
        consultation.startedAt = new Date();
      } else if (parsed.data.status === "completed") {
        consultation.completedAt = new Date();
      }
    }
    if (parsed.data.diagnosis) consultation.diagnosis = parsed.data.diagnosis;
    if (parsed.data.treatmentPlan)
      consultation.treatmentPlan = parsed.data.treatmentPlan;
    if (parsed.data.notes) consultation.notes = parsed.data.notes;

    await consultation.save();

    return NextResponse.json({
      success: true,
      message: "Consultation updated successfully",
      data: consultation,
    });
  } catch (error) {
    console.error("[consultations/id] PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update consultation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid consultation ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return NextResponse.json(
        { success: false, message: "Consultation not found" },
        { status: 404 }
      );
    }

    // Only owner or vet can cancel
    const isOwner = consultation.ownerId.toString() === payload.userId;
    const isVet = consultation.vetId.toString() === payload.userId;

    if (!isOwner && !isVet) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Can only cancel if not already completed
    if (consultation.status === "completed" || consultation.status === "cancelled") {
      return NextResponse.json(
        { success: false, message: "Cannot cancel completed or already cancelled consultation" },
        { status: 400 }
      );
    }

    // TODO: Process refund if applicable
    consultation.status = "cancelled";
    await consultation.save();

    return NextResponse.json({
      success: true,
      message: "Consultation cancelled successfully",
    });
  } catch (error) {
    console.error("[consultations/id] DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to cancel consultation" },
      { status: 500 }
    );
  }
}
