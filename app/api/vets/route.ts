import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db/connect";
import { getSession } from "@/lib/auth/session";
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
  password: z.string().min(8).optional(),
  phone: z.string().optional(),
  profilePhotoName: z.string().min(1),
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

    // Check for duplicate license number
    const existingLicense = await VetProfile.findOne({
      licenseNumber: parsed.data.licenseNumber,
    });
    if (existingLicense) {
      return NextResponse.json(
        { success: false, message: "License number already submitted" },
        { status: 409 }
      );
    }

    const session = await getSession();
    let user = session
      ? await User.findById(session.userId)
      : await User.findOne({ email: parsed.data.email });
    const isSignedInApplication = Boolean(session);

    if (session && !user) {
      return NextResponse.json(
        { success: false, message: "Signed-in account not found" },
        { status: 404 }
      );
    }

    if (!user) {
      // Create new User if doesn't exist
      if (!parsed.data.password) {
        return NextResponse.json(
          { success: false, message: "Password is required for new accounts" },
          { status: 400 }
        );
      }

      const passwordHash = await hashPassword(parsed.data.password);
      try {
        user = await User.create({
          name: parsed.data.name,
          email: parsed.data.email,
          passwordHash,
          phone: parsed.data.phone,
          role: "user", // New users default to "user"
        });
      } catch (err: unknown) {
        // Handle MongoDB duplicate key error
        if (
          err instanceof Error &&
          "code" in err &&
          err.code === 11000
        ) {
          return NextResponse.json(
            { success: false, message: "Email already registered" },
            { status: 409 }
          );
        }
        throw err;
      }
    } else {
      if (
        isSignedInApplication &&
        (user.email.toLowerCase() !== parsed.data.email.toLowerCase() ||
          user.name !== parsed.data.name ||
          (user.phone ?? "") !== (parsed.data.phone ?? ""))
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Application identity must match your signed-in account details.",
          },
          { status: 400 }
        );
      }

      // User already exists - check if they already have a vet profile
      const existingVetProfile = await VetProfile.findOne({ userId: user._id });
      if (existingVetProfile) {
        return NextResponse.json(
          { success: false, message: "You already have a vet application. Wait for admin review or contact support." },
          { status: 409 }
        );
      }
    }

    let profile;
    try {
      profile = await VetProfile.create({
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
        profilePhotoName: parsed.data.profilePhotoName,
        licenseDocumentName: parsed.data.licenseFileName,
        degreeDocumentName: parsed.data.degreeFileName,
        isActive: true,
        acceptingNewPatients: false,
        availability: [],
      });
    } catch (err: unknown) {
      // Handle MongoDB duplicate key error
      if (
        err instanceof Error &&
        "code" in err &&
        err.code === 11000
      ) {
        return NextResponse.json(
          { success: false, message: "License number already submitted" },
          { status: 409 }
        );
      }
      throw err;
    }

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

    // Check if it's a MongoDB duplicate key error
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === 11000
    ) {
      const field = Object.keys(
        (error as Record<string, unknown>).keyPattern || {}
      )[0];
      const message = field
        ? `This ${field} is already registered`
        : "Duplicate entry found";
      return NextResponse.json(
        { success: false, message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to submit vet application" },
      { status: 500 }
    );
  }
}
