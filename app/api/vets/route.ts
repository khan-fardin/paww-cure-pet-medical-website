import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db/connect";
import { VetProfile } from "@/lib/db/models/VetProfile";
import { verifyToken } from "@/lib/auth/jwt";

const querySchema = z.object({
  city: z.string().optional(),
  specialization: z.string().optional(),
  minRating: z.string().transform(Number).optional(),
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
});

// TODO: Implement full-text search for clinic name and vet name
// TODO: Add pagination cursor support
// TODO: Implement caching for vet listings

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = {
      city: searchParams.get("city") || undefined,
      specialization: searchParams.get("specialization") || undefined,
      minRating: searchParams.get("minRating")
        ? Number(searchParams.get("minRating"))
        : undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 10,
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

    const filter: any = {
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
