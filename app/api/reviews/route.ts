import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth/jwt";
import { dbConnect } from "@/lib/db/connect";
import { Review } from "@/lib/db/models/Review";
import { Consultation } from "@/lib/db/models/Consultation";
import { VetProfile } from "@/lib/db/models/VetProfile";

// TODO: Implement review moderation and flagging system
// TODO: Add review verification (only after consultation completed)
// TODO: Send vet notification when new review received
// TODO: Auto-update vet average rating when review posted

const createReviewSchema = z.object({
  consultationId: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().min(3).max(100),
  comment: z.string().min(10).max(1000),
  professionalism: z.number().min(1).max(5).optional(),
  communication: z.number().min(1).max(5).optional(),
  punctuality: z.number().min(1).max(5).optional(),
  cleanliness: z.number().min(1).max(5).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const vetId = searchParams.get("vetId");
    const consultationId = searchParams.get("consultationId");

    await dbConnect();

    let query: any = { isVisible: true };

    if (vetId) {
      query.vetId = vetId;
    }
    if (consultationId) {
      query.consultationId = consultationId;
    }

    const reviews = await Review.find(query)
      .select("-__v")
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: reviews,
    });
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
        { success: false, message: "Only users can submit reviews" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);

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

    const consultation = await Consultation.findById(
      parsed.data.consultationId
    );

    if (!consultation || consultation.userId.toString() !== payload.userId) {
      return NextResponse.json(
        { success: false, message: "Consultation not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      consultationId: parsed.data.consultationId,
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: "Review already exists for this consultation" },
        { status: 409 }
      );
    }

    const review = await Review.create({
      consultationId: parsed.data.consultationId,
      vetId: consultation.vetId,
      userId: payload.userId,
      rating: parsed.data.rating,
      title: parsed.data.title,
      comment: parsed.data.comment,
      professionalism: parsed.data.professionalism,
      communication: parsed.data.communication,
      punctuality: parsed.data.punctuality,
      cleanliness: parsed.data.cleanliness,
    });

    // TODO: Update vet profile average rating
    // TODO: Send notification to vet

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully",
        data: review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[reviews] POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit review" },
      { status: 500 }
    );
  }
}
