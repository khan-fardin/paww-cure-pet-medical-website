import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db/connect";
import { getSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/hash";
import { User } from "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";
import { notifyRoles } from "@/lib/services/notification.service";

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
  degreePublicId: z.string().min(1),
  degreeResourceType: z.enum(["image", "raw", "video"]),
  email: z.string().email(),
  experience: z.coerce.number().min(0).default(0),
  expiryDate: z.string().optional(),
  issuingAuthority: z.string().optional(),
  languages: z.string().optional(),
  licenseFileName: z.string().optional(),
  licensePublicId: z.string().min(1),
  licenseResourceType: z.enum(["image", "raw", "video"]),
  licenseNumber: z.string().min(2),
  name: z.string().min(2),
  password: z.string().min(8).optional(),
  phone: z.string().optional(),
  profilePhotoName: z.string().min(1),
  profilePhotoPublicId: z.string().min(1),
  profilePhotoUrl: z.string().url(),
  specialties: z.array(z.string()).default([]),
});

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeList(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  );
}

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
    const baseFilter: Record<string, unknown> = {
      isVerified: true,
      isActive: true,
      acceptingNewPatients: true,
    };
    const filter: Record<string, unknown> = { ...baseFilter };

    if (parsed.data.city) {
      filter.clinicCity = { $regex: parsed.data.city, $options: "i" };
    }

    if (parsed.data.specialization) {
      filter.specializations = {
        $in: [new RegExp(`^${escapeRegex(parsed.data.specialization)}$`, "i")],
      };
    }

    if (parsed.data.minRating) {
      filter.averageRating = { $gte: parsed.data.minRating };
    }

    const skip = (parsed.data.page - 1) * parsed.data.limit;

    const [vets, total, specializationOptions, cityOptions] = await Promise.all([
      VetProfile.find(filter)
      .select("-__v")
      .populate("userId", "name avatar")
      .limit(parsed.data.limit)
      .skip(skip)
        .sort({ averageRating: -1 }),
      VetProfile.countDocuments(filter),
      VetProfile.distinct("specializations", baseFilter),
      VetProfile.distinct("clinicCity", baseFilter),
    ]);

    return NextResponse.json({
      success: true,
      data: vets,
      filters: {
        cities: normalizeList(cityOptions).sort((a, b) => a.localeCompare(b)),
        specializations: normalizeList(specializationOptions).sort((a, b) =>
          a.localeCompare(b)
        ),
      },
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
          avatar: parsed.data.profilePhotoUrl,
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

    const avatarPrefix = `pawwcure/avatars/${user._id.toString()}-`;
    const documentPrefix = `pawwcure/vet-documents/${user._id.toString()}-`;
    if (
      !parsed.data.profilePhotoPublicId.startsWith(avatarPrefix) ||
      !parsed.data.licensePublicId.startsWith(documentPrefix) ||
      !parsed.data.degreePublicId.startsWith(documentPrefix) ||
      new URL(parsed.data.profilePhotoUrl).hostname !== "res.cloudinary.com"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more uploaded files do not belong to this account.",
        },
        { status: 403 },
      );
    }

    user.avatar = parsed.data.profilePhotoUrl;
    user.avatarPublicId = parsed.data.profilePhotoPublicId;
    await user.save();

    let profile;
    try {
      profile = await VetProfile.create({
        userId: user._id,
        licenseNumber: parsed.data.licenseNumber,
        issuingAuthority: parsed.data.issuingAuthority,
        licenseExpiryDate: parsed.data.expiryDate
          ? new Date(parsed.data.expiryDate)
          : undefined,
        specializations: normalizeList(parsed.data.specialties),
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
        servicesOffered: normalizeList(parsed.data.specialties),
        consultationFee: parsed.data.consultFee,
        consultationDuration: 30,
        isVerified: false,
        applicationStatus: "submitted",
        profilePhotoName: parsed.data.profilePhotoName,
        profilePhotoPublicId: parsed.data.profilePhotoPublicId,
        licenseDocumentName: parsed.data.licenseFileName,
        licenseDocumentPublicId: parsed.data.licensePublicId,
        licenseDocumentResourceType: parsed.data.licenseResourceType,
        degreeDocumentName: parsed.data.degreeFileName,
        degreeDocumentPublicId: parsed.data.degreePublicId,
        degreeDocumentResourceType: parsed.data.degreeResourceType,
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

    await Promise.all([
      notifyRoles({
        body: `${user.name} submitted a vet application for verification.`,
        link: "/mod/vets",
        roles: ["mod"],
        title: "New vet application",
        type: "system",
      }),
      notifyRoles({
        body: `${user.name} submitted a vet application.`,
        link: "/admin/vets",
        roles: ["admin"],
        title: "Vet application submitted",
        type: "system",
      }),
    ]);

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
