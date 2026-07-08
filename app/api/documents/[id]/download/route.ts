import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { Document } from "@/lib/db/models/Document";
import { getPresignedReadUrl } from "@/lib/services/s3.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid document ID" },
        { status: 400 }
      );
    }

    await dbConnect();
    const document = await Document.findById(id);
    if (!document || !document.s3Key) {
      return NextResponse.json(
        { success: false, message: "Document not found" },
        { status: 404 }
      );
    }

    const isOwner = document.userId.toString() === session.userId;
    const isUploader = document.uploadedBy.toString() === session.userId;
    const isStaff = session.role === "admin" || session.role === "mod";
    const isConsultationVet =
      session.role === "vet" &&
      document.relatedConsultationId &&
      Boolean(
        await Consultation.exists({
          _id: document.relatedConsultationId,
          vetId: session.userId,
        })
      );

    if (!isOwner && !isUploader && !isStaff && !isConsultationVet) {
      return NextResponse.json(
        { success: false, message: "You cannot access this document" },
        { status: 403 }
      );
    }

    return NextResponse.redirect(await getPresignedReadUrl(document.s3Key));
  } catch (error) {
    console.error("[documents/download] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to open document" },
      { status: 500 }
    );
  }
}
