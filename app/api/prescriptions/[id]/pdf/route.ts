import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import "@/lib/db/models/Pet";
import { Prescription } from "@/lib/db/models/Prescription";
import "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";
import { generatePrescriptionPdf } from "@/lib/services/prescription-pdf.service";

type PopulatedEntity = {
  _id: { toString(): string };
  breed?: string;
  name?: string;
  species?: string;
};

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
        { success: false, message: "Invalid prescription ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const prescription = await Prescription.findById(id)
      .populate("petId", "name species breed")
      .populate("vetId", "name");

    if (!prescription) {
      return NextResponse.json(
        { success: false, message: "Prescription not found" },
        { status: 404 }
      );
    }

    const consultation = await Consultation.findById(
      prescription.consultationId
    ).populate("userId", "name");

    if (!consultation) {
      return NextResponse.json(
        { success: false, message: "Consultation not found" },
        { status: 404 }
      );
    }

    const isUser = consultation.userId._id.toString() === session.userId;
    const isVet = prescription.vetId._id.toString() === session.userId;
    const isStaff = session.role === "admin" || session.role === "mod";

    if (!isUser && !isVet && !isStaff) {
      return NextResponse.json(
        { success: false, message: "You cannot download this prescription" },
        { status: 403 }
      );
    }

    const vetProfile = await VetProfile.findOne({
      userId: prescription.vetId._id,
    }).select("clinicName licenseNumber specializations");
    const pet = prescription.petId as unknown as PopulatedEntity;
    const vet = prescription.vetId as unknown as PopulatedEntity;
    const user = consultation.userId as unknown as PopulatedEntity;
    const bytes = await generatePrescriptionPdf({
      consultationId: consultation._id.toString(),
      diagnosis: consultation.diagnosis,
      issuedAt: prescription.issuedDate,
      medications: prescription.medications,
      pet: {
        breed: pet.breed,
        name: pet.name ?? "Pet",
        species: pet.species,
      },
      prescription: {
        dietRecommendations: prescription.dietRecommendations,
        expiryDate: prescription.expiryDate,
        followUpInstructions: prescription.followUpInstructions,
        precautions: prescription.precautions,
      },
      user: { name: user.name ?? "User" },
      vet: {
        clinicName: vetProfile?.clinicName,
        licenseNumber: vetProfile?.licenseNumber,
        name: vet.name ?? "Veterinarian",
        specializations: vetProfile?.specializations,
      },
    });

    return new Response(Buffer.from(bytes), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="pawwcure-${pet.name ?? "pet"}-prescription.pdf"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("[prescription-pdf] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate prescription PDF" },
      { status: 500 }
    );
  }
}
