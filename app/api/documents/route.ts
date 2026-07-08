import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { Document } from "@/lib/db/models/Document";
import { Pet } from "@/lib/db/models/Pet";

const createDocumentSchema = z.object({
  petId: z.string().min(1),
  type: z.enum([
    "prescription",
    "lab-report",
    "vaccination",
    "discharge-summary",
    "medical-record",
    "x-ray",
    "other",
  ]),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  s3Key: z.string().min(3),
  fileSize: z.number().positive(),
  mimeType: z.string(),
  relatedConsultationId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const petId = searchParams.get("petId");

    await dbConnect();

    const query: Record<string, unknown> =
      session.role === "vet"
        ? { uploadedBy: session.userId }
        : { userId: session.userId };

    if (petId) {
      query.petId = petId;
    }

    const documents = await Document.find(query)
      .select("-__v")
      .populate("petId", "name species breed")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("[documents] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = createDocumentSchema.safeParse(body);

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

    const pet = await Pet.findById(parsed.data.petId);
    if (!pet) {
      return NextResponse.json(
        { success: false, message: "Pet not found" },
        { status: 404 }
      );
    }

    const isOwner = pet.userId.toString() === session.userId;
    const isAssignedVet =
      session.role === "vet" &&
      parsed.data.relatedConsultationId &&
      Boolean(
        await Consultation.exists({
          _id: parsed.data.relatedConsultationId,
          petId: pet._id,
          vetId: session.userId,
        })
      );

    if (!isOwner && !isAssignedVet) {
      return NextResponse.json(
        { success: false, message: "You cannot attach files to this pet" },
        { status: 403 }
      );
    }

    const document = await Document.create({
      userId: pet.userId,
      petId: parsed.data.petId,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      fileUrl: `s3://${process.env.S3_BUCKET_NAME}/${parsed.data.s3Key}`,
      s3Key: parsed.data.s3Key,
      fileSize: parsed.data.fileSize,
      mimeType: parsed.data.mimeType,
      uploadedBy: session.userId,
      relatedConsultationId: parsed.data.relatedConsultationId,
      tags: parsed.data.tags || [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Document uploaded successfully",
        data: document,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[documents] POST error:", error);

    // Check if it's a MongoDB duplicate key error
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: "This document already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to upload document" },
      { status: 500 }
    );
  }
}
