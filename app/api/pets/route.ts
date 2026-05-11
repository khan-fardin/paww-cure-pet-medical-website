import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth/jwt";
import { dbConnect } from "@/lib/db/connect";
import { Pet } from "@/lib/db/models/Pet";

const createPetSchema = z.object({
  name: z.string().min(1).max(50),
  species: z.enum(["dog", "cat", "rabbit", "bird", "other"]),
  breed: z.string().min(1).max(50),
  weight: z.number().positive(),
  dateOfBirth: z.string().datetime(),
  avatar: z.string().optional(),
  microchipId: z.string().optional(),
  medicalConditions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
});

// TODO: Implement file upload for avatar
// TODO: Implement validation for microchipId uniqueness

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

    if (payload.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Only pet users can view pets" },
        { status: 403 }
      );
    }

    await dbConnect();

    const pets = await Pet.find({
      userId: payload.userId,
      isActive: true,
    }).select("-__v");

    return NextResponse.json({
      success: true,
      data: pets,
    });
  } catch (error) {
    console.error("[pets] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch pets" },
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

    if (payload.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Only pet users can create pets" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createPetSchema.safeParse(body);

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

    // TODO: Check for duplicate microchipId if provided
    // TODO: Validate species-specific breed combinations

    const pet = await Pet.create({
      userId: payload.userId,
      name: parsed.data.name,
      species: parsed.data.species,
      breed: parsed.data.breed,
      weight: parsed.data.weight,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      avatar: parsed.data.avatar,
      microchipId: parsed.data.microchipId,
      medicalConditions: parsed.data.medicalConditions || [],
      allergies: parsed.data.allergies || [],
      medications: parsed.data.medications || [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pet created successfully",
        data: pet,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[pets] POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create pet" },
      { status: 500 }
    );
  }
}
