import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { Pet } from "@/lib/db/models/Pet";
import { getPresignedUploadUrl } from "@/lib/services/s3.service";

const schema = z.object({
  consultationId: z.string().optional(),
  fileName: z.string().trim().min(1).max(180),
  fileSize: z.number().positive().max(15 * 1024 * 1024),
  mimeType: z.enum([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ]),
  petId: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value)),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Unsupported file or file is too large" },
        { status: 400 }
      );
    }

    await dbConnect();
    const pet = await Pet.findById(parsed.data.petId).select("userId");
    if (!pet) {
      return NextResponse.json(
        { success: false, message: "Pet not found" },
        { status: 404 }
      );
    }

    const isOwner = pet.userId.toString() === session.userId;
    let isAssignedVet = false;
    if (session.role === "vet" && parsed.data.consultationId) {
      isAssignedVet = Boolean(
        await Consultation.exists({
          _id: parsed.data.consultationId,
          petId: pet._id,
          vetId: session.userId,
        })
      );
    }

    if (!isOwner && !isAssignedVet) {
      return NextResponse.json(
        { success: false, message: "You cannot upload for this pet" },
        { status: 403 }
      );
    }

    const extension = parsed.data.fileName.split(".").pop()?.toLowerCase() || "bin";
    const key = `pet-records/${pet._id.toString()}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const uploadUrl = await getPresignedUploadUrl({
      contentType: parsed.data.mimeType,
      key,
    });

    return NextResponse.json({
      success: true,
      data: { key, uploadUrl },
    });
  } catch (error) {
    console.error("[documents/presign] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to prepare upload" },
      { status: 500 }
    );
  }
}
