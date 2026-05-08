import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth/jwt";
import { dbConnect } from "@/lib/db/connect";
import { VetProfile } from "@/lib/db/models/VetProfile";
import { Review } from "@/lib/db/models/Review";
import mongoose from "mongoose";

// TODO: Add availability slots generation
// TODO: Implement consultation booking history for authenticated users
// TODO: Cache vet profiles with Redis
// TODO: Implement admin verification process for profile changes
// TODO: Add audit log for profile updates
// TODO: Send email notification on availability changes

const updateVetSchema = z.object({
  specializations: z.array(z.string()).optional(),
  bio: z.string().optional(),
  clinicName: z.string().optional(),
  clinicAddress: z.string().optional(),
  clinicCity: z.string().optional(),
  clinicProvince: z.string().optional(),
  clinicPostalCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  servicesOffered: z.array(z.string()).optional(),
  consultationFee: z.number().positive().optional(),
  consultationDuration: z.number().min(15).optional(),
  acceptingNewPatients: z.boolean().optional(),
  availability: z
    .array(
      z.object({
        day: z.enum([
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ]),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: "Invalid vet ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const vetProfile = await VetProfile.findById(params.id)
      .select("-__v")
      .populate("userId", "name email avatar");

    if (!vetProfile) {
      return NextResponse.json(
        { success: false, message: "Vet not found" },
        { status: 404 }
      );
    }

    // Fetch reviews
    const reviews = await Review.find({
      vetId: params.id,
      isVisible: true,
    })
      .select("-__v")
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        ...vetProfile.toObject(),
        reviews,
      },
    });
  } catch (error) {
    console.error("[vets/id] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vet profile" },
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

    if (payload.role !== "vet") {
      return NextResponse.json(
        { success: false, message: "Only vets can update profiles" },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: "Invalid vet profile ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = updateVetSchema.safeParse(body);

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

    const vetProfile = await VetProfile.findById(params.id);

    if (!vetProfile) {
      return NextResponse.json(
        { success: false, message: "Vet profile not found" },
        { status: 404 }
      );
    }

    // Ensure vet is updating their own profile
    if (vetProfile.userId.toString() !== payload.userId) {
      return NextResponse.json(
        { success: false, message: "You can only update your own profile" },
        { status: 403 }
      );
    }

    // Update fields
    if (parsed.data.specializations)
      vetProfile.specializations = parsed.data.specializations;
    if (parsed.data.bio) vetProfile.bio = parsed.data.bio;
    if (parsed.data.clinicName) vetProfile.clinicName = parsed.data.clinicName;
    if (parsed.data.clinicAddress)
      vetProfile.clinicAddress = parsed.data.clinicAddress;
    if (parsed.data.clinicCity) vetProfile.clinicCity = parsed.data.clinicCity;
    if (parsed.data.clinicProvince)
      vetProfile.clinicProvince = parsed.data.clinicProvince;
    if (parsed.data.clinicPostalCode)
      vetProfile.clinicPostalCode = parsed.data.clinicPostalCode;
    if (parsed.data.phoneNumber) vetProfile.phoneNumber = parsed.data.phoneNumber;
    if (parsed.data.servicesOffered)
      vetProfile.servicesOffered = parsed.data.servicesOffered;
    if (parsed.data.consultationFee)
      vetProfile.consultationFee = parsed.data.consultationFee;
    if (parsed.data.consultationDuration)
      vetProfile.consultationDuration = parsed.data.consultationDuration;
    if (typeof parsed.data.acceptingNewPatients === "boolean")
      vetProfile.acceptingNewPatients = parsed.data.acceptingNewPatients;
    if (parsed.data.availability) vetProfile.availability = parsed.data.availability;

    await vetProfile.save();

    return NextResponse.json({
      success: true,
      message: "Vet profile updated successfully",
      data: vetProfile,
    });
  } catch (error) {
    console.error("[vets/id] PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update vet profile" },
      { status: 500 }
    );
  }
}
