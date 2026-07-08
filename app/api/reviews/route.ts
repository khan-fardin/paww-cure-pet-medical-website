import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { Review } from "@/lib/db/models/Review";
import { notifyUser } from "@/lib/services/notification.service";
import { syncVetReviewStats } from "@/lib/services/review.service";

const createReviewSchema = z.object({
  comment: z.string().trim().min(10).max(1000),
  communication: z.number().int().min(1).max(5),
  consultationId: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value)),
  professionalism: z.number().int().min(1).max(5),
  punctuality: z.number().int().min(1).max(5),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(100),
});

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const vetId = req.nextUrl.searchParams.get("vetId");
    const consultationId = req.nextUrl.searchParams.get("consultationId");
    const query: Record<string, unknown> = { isVisible: true };

    if (vetId) query.vetId = vetId;
    if (consultationId) query.consultationId = consultationId;

    const reviews = await Review.find(query)
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error("[reviews] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (session.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Only users can submit reviews" },
        { status: 403 }
      );
    }

    const parsed = createReviewSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Please complete every review field" },
        { status: 400 }
      );
    }

    await dbConnect();

    const consultation = await Consultation.findOne({
      _id: parsed.data.consultationId,
      status: "completed",
      userId: session.userId,
    }).select("vetId");

    if (!consultation) {
      return NextResponse.json(
        {
          success: false,
          message: "Reviews are available only after your consultation is completed",
        },
        { status: 403 }
      );
    }

    const existingReview = await Review.exists({
      consultationId: consultation._id,
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: "You already reviewed this consultation" },
        { status: 409 }
      );
    }

    const review = await Review.create({
      ...parsed.data,
      consultationId: consultation._id,
      isVerifiedPurchase: true,
      userId: session.userId,
      vetId: consultation.vetId,
    });

    await Promise.all([
      syncVetReviewStats(consultation.vetId),
      notifyUser({
        body: `You received a ${review.rating}-star review: ${review.title}`,
        email: true,
        link: "/vet/reviews",
        title: "New consultation review",
        type: "review",
        userId: consultation.vetId,
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully",
        data: { id: review._id.toString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[reviews] POST error:", error);

    if (
      error instanceof Error &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: "You already reviewed this consultation" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to submit review" },
      { status: 500 }
    );
  }
}
