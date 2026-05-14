import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db/connect";
import { hashPassword } from "@/lib/auth/hash";
import { User } from "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";

const querySchema = z.object({
  city: z.string().optional(),
  specialization: z.string().optional(),
  minRating: z.string().transform(Number).optional(),
  page: z.string().default("1").transform(Number),
  limit: z.string().default("10").transform(Number),
});

const vetApplicationSchema = z.object({
  bio: z.string().optional(),
  clinicAddress: z.string().min(2),
  clinicCity: z.string().min(2),
  clinicName: z.string().min(2),
  clinicPostalCode: z.string().min(2),
  clinicProvince: z.string().min(2),
  consultFee: z.coerce.number().min(0).default(0),
  degreeFileName: z.string().optional(),
  email: z.string().email(),
  experience: z.coerce.number().min(0).default(0),
  expiryDate: z.string().optional(),
  issuingAuthority: z.string().optional(),
  languages: z.string().optional(),
  licenseFileName: z.string().optional(),
  licenseNumber: z.string().min(2),
  name: z.string().min(2),
  password: z.string().min(8),
  phone: z.string().optional(),
  specialties: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = {
      city: searchParams.get("city") || undefined,
      specialization: searchParams.get("specialization") || undefined,
      minRating: searchParams.get("minRating") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
    };

    const parsed = querySchema.safeParse(query);

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
    const filter: Record<string, unknown> = {
      isVerified: true,
      isActive: true,
      acceptingNewPatients: true,
    };

    if (parsed.data.city) {
      filter.clinicCity = { $regex: parsed.data.city, $options: "i" };
    }

    if (parsed.data.specialization) {
      filter.specializations = { $in: [parsed.data.specialization] };
    }

    if (parsed.data.minRating) {
      filter.averageRating = { $gte: parsed.data.minRating };
    }

    const skip = (parsed.data.page - 1) * parsed.data.limit;

    const vets = await VetProfile.find(filter)
      .select("-__v")
      .populate("userId", "name avatar")
      .limit(parsed.data.limit)
      .skip(skip)
      .sort({ averageRating: -1 });

    const total = await VetProfile.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: vets,
      pagination: {
        page: parsed.data.page,
        limit: parsed.data.limit,
        total,
        pages: Math.ceil(total / parsed.data.limit),
      },
    });
  } catch (error) {
    console.error("[vets] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vets" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = vetApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please complete the required application fields.",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingUser = await VetProfile.findOne({ email: parsed.data.email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    const existingLicense = await VetProfile.findOne({
      licenseNumber: parsed.data.licenseNumber,
    });
    if (existingLicense) {
      return NextResponse.json(
        { success: false, message: "License number already submitted" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      phone: parsed.data.phone,
      role: "vet",
    });

    const profile = await VetProfile.create({
      userId: user._id,
      licenseNumber: parsed.data.licenseNumber,
      issuingAuthority: parsed.data.issuingAuthority,
      licenseExpiryDate: parsed.data.expiryDate
        ? new Date(parsed.data.expiryDate)
        : undefined,
      specializations: parsed.data.specialties,
      languages: parsed.data.languages
        ? parsed.data.languages
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      experience: parsed.data.experience,
      bio: parsed.data.bio,
      clinicName: parsed.data.clinicName,
      clinicAddress: parsed.data.clinicAddress,
      clinicCity: parsed.data.clinicCity,
      clinicProvince: parsed.data.clinicProvince,
      clinicPostalCode: parsed.data.clinicPostalCode,
      phoneNumber: parsed.data.phone ?? "",
      servicesOffered: parsed.data.specialties,
      consultationFee: parsed.data.consultFee,
      consultationDuration: 30,
      isVerified: false,
      applicationStatus: "submitted",
      licenseDocumentName: parsed.data.licenseFileName,
      degreeDocumentName: parsed.data.degreeFileName,
      isActive: true,
      acceptingNewPatients: false,
      availability: [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Vet application submitted",
        data: profile,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[vets] POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit vet application" },
      { status: 500 }
    );
  }
}
