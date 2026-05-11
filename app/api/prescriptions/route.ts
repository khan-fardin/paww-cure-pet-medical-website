import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth/jwt";
import { dbConnect } from "@/lib/db/connect";
import { Prescription } from "@/lib/db/models/Prescription";
import { Consultation } from "@/lib/db/models/Consultation";

// TODO: Implement prescription printing/PDF generation
// TODO: Add pharmacy integration for refill requests
// TODO: Track prescription usage history

const createPrescriptionSchema = z.object({
  consultationId: z.string().min(1),
  medications: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      duration: z.string(),
      instructions: z.string().optional(),
    })
  ),
  precautions: z.array(z.string()).optional(),
  dietRecommendations: z.string().optional(),
  followUpInstructions: z.string().optional(),
  expiryDate: z.string().datetime(),
});

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

    if (payload.role === "user") {
      // Get prescriptions for user's pets
      const consultations = await Consultation.find({
        userId: payload.userId,
      }).select("_id");
      const consultationIds = consultations.map((c) => c._id);
      query.consultationId = { $in: consultationIds };
    } else if (payload.role === "vet") {
      query.vetId = payload.userId;
    }

    const prescriptions = await Prescription.find(query)
      .select("-__v")
      .populate("petId", "name species breed")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error("[prescriptions] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch prescriptions" },
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

    if (payload.role !== "vet") {
      return NextResponse.json(
        { success: false, message: "Only vets can create prescriptions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createPrescriptionSchema.safeParse(body);

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

    const consultation = await Consultation.findById(
      parsed.data.consultationId
    );

    if (!consultation || consultation.vetId.toString() !== payload.userId) {
      return NextResponse.json(
        { success: false, message: "Consultation not found or unauthorized" },
        { status: 404 }
      );
    }

    const prescription = await Prescription.create({
      consultationId: parsed.data.consultationId,
      petId: consultation.petId,
      vetId: payload.userId,
      medications: parsed.data.medications,
      precautions: parsed.data.precautions,
      dietRecommendations: parsed.data.dietRecommendations,
      followUpInstructions: parsed.data.followUpInstructions,
      expiryDate: new Date(parsed.data.expiryDate),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Prescription created successfully",
        data: prescription,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[prescriptions] POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create prescription" },
      { status: 500 }
    );
  }
}
