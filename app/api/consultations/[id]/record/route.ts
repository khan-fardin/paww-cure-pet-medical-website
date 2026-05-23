import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { Notification } from "@/lib/db/models/Notification";

const recordSchema = z.object({
  diagnosis: z.string().min(2),
  followUpDueDate: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      message: "Invalid follow-up date",
    }),
  notes: z.string().optional(),
  treatmentPlan: z.string().min(2),
});

export async function POST(
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
        { success: false, message: "Only vets can write consultation records" },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid consultation ID" },
        { status: 400 }
      );
    }

    const parsed = recordSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten() },
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

    if (consultation.vetId.toString() !== session.userId) {
      return NextResponse.json(
        { success: false, message: "You are not assigned to this consultation" },
        { status: 403 }
      );
    }

    if (consultation.paymentStatus !== "completed") {
      return NextResponse.json(
        { success: false, message: "Payment is not confirmed yet" },
        { status: 402 }
      );
    }

    consultation.diagnosis = parsed.data.diagnosis;
    consultation.treatmentPlan = parsed.data.treatmentPlan;
    consultation.notes = parsed.data.notes;
    consultation.status = "completed";
    consultation.completedAt = new Date();
    consultation.followUpDueDate = parsed.data.followUpDueDate
      ? new Date(parsed.data.followUpDueDate)
      : undefined;

    await Promise.all([
      consultation.save(),
      Notification.create({
        body: "Your vet has added diagnosis and treatment notes.",
        link: `/consultation/${consultation._id.toString()}/summary`,
        title: "Consultation record ready",
        type: "consultation",
        userId: consultation.userId,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: consultation,
      message: "Consultation record saved",
    });
  } catch (error) {
    console.error("[consultation-record] POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save consultation record" },
      { status: 500 }
    );
  }
}
