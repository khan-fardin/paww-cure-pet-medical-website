import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth/jwt";
import { dbConnect } from "@/lib/db/connect";
import { Pet } from "@/lib/db/models/Pet";
import mongoose from "mongoose";

const updatePetSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  breed: z.string().min(1).max(50).optional(),
  weight: z.number().positive().optional(),
  dateOfBirth: z.string().datetime().optional(),
  avatar: z.string().optional(),
  medicalConditions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  vaccinationStatus: z.enum(["up-to-date", "pending", "overdue"]).optional(),
  lastVaccineDate: z.string().datetime().optional(),
});

// TODO: Add activity logging for pet updates
// TODO: Implement soft delete option

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: "Invalid pet ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const pet = await Pet.findById(params.id).select("-__v");

    if (!pet) {
      return NextResponse.json(
        { success: false, message: "Pet not found" },
        { status: 404 }
      );
    }

    // Check ownership or vet access
    if (
      pet.ownerId.toString() !== payload.userId &&
      payload.role !== "vet" &&
      payload.role !== "admin"
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: pet,
    });
  } catch (error) {
    console.error("[pets/id] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch pet" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { success: false, message: "Only owners can update pets" },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: "Invalid pet ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = updatePetSchema.safeParse(body);

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

    const pet = await Pet.findById(params.id);

    if (!pet) {
      return NextResponse.json(
        { success: false, message: "Pet not found" },
        { status: 404 }
      );
    }

    if (pet.ownerId.toString() !== payload.userId) {
      return NextResponse.json(
        { success: false, message: "You can only update your own pets" },
        { status: 403 }
      );
    }

    // Update pet fields
    if (parsed.data.name) pet.name = parsed.data.name;
    if (parsed.data.breed) pet.breed = parsed.data.breed;
    if (parsed.data.weight) pet.weight = parsed.data.weight;
    if (parsed.data.dateOfBirth)
      pet.dateOfBirth = new Date(parsed.data.dateOfBirth);
    if (parsed.data.avatar) pet.avatar = parsed.data.avatar;
    if (parsed.data.medicalConditions)
      pet.medicalConditions = parsed.data.medicalConditions;
    if (parsed.data.allergies) pet.allergies = parsed.data.allergies;
    if (parsed.data.medications) pet.medications = parsed.data.medications;
    if (parsed.data.vaccinationStatus)
      pet.vaccinationStatus = parsed.data.vaccinationStatus;
    if (parsed.data.lastVaccineDate)
      pet.lastVaccineDate = new Date(parsed.data.lastVaccineDate);

    await pet.save();

    return NextResponse.json({
      success: true,
      message: "Pet updated successfully",
      data: pet,
    });
  } catch (error) {
    console.error("[pets/id] PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update pet" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { success: false, message: "Only owners can delete pets" },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: "Invalid pet ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const pet = await Pet.findById(params.id);

    if (!pet) {
      return NextResponse.json(
        { success: false, message: "Pet not found" },
        { status: 404 }
      );
    }

    if (pet.ownerId.toString() !== payload.userId) {
      return NextResponse.json(
        { success: false, message: "You can only delete your own pets" },
        { status: 403 }
      );
    }

    // Soft delete by marking as inactive
    pet.isActive = false;
    await pet.save();

    // TODO: Handle cascade deletion - cancel pending consultations, archive documents

    return NextResponse.json({
      success: true,
      message: "Pet deleted successfully",
    });
  } catch (error) {
    console.error("[pets/id] DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete pet" },
      { status: 500 }
    );
  }
}
