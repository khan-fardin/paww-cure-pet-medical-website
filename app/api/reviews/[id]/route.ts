import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Review } from "@/lib/db/models/Review";
import { ReviewAudit } from "@/lib/db/models/ReviewAudit";
import { syncVetReviewStats } from "@/lib/services/review.service";
import { notifyRoles } from "@/lib/services/notification.service";

const updateReviewSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("respond"),
    response: z.string().trim().min(3).max(1000),
  }),
  z.object({
    action: z.literal("hide"),
    reason: z.string().trim().min(3).max(300),
  }),
  z.object({ action: z.literal("restore") }),
  z.object({ action: z.literal("helpful") }),
  z.object({
    action: z.literal("report"),
    reason: z.string().trim().min(5).max(300),
  }),
]);

export async function PATCH(
  req: NextRequest,
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
        { success: false, message: "Invalid review ID" },
        { status: 400 }
      );
    }

    const parsed = updateReviewSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid review action" },
        { status: 400 }
      );
    }

    await dbConnect();
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    let audit:
      | {
          action: "reported" | "hidden" | "restored";
          previousVisibility: boolean;
          reason?: string;
          resultingVisibility: boolean;
        }
      | undefined;

    if (parsed.data.action === "helpful") {
      if (
        review.userId.toString() === session.userId ||
        review.vetId.toString() === session.userId
      ) {
        return NextResponse.json(
          { success: false, message: "You cannot vote on your own review" },
          { status: 400 }
        );
      }

      review.helpfulBy ??= [];
      const userId = new mongoose.Types.ObjectId(session.userId);
      const hasVoted = review.helpfulBy.some(
        (id: mongoose.Types.ObjectId) => id.toString() === session.userId
      );

      if (hasVoted) {
        review.helpfulBy = review.helpfulBy.filter(
          (id: mongoose.Types.ObjectId) => id.toString() !== session.userId
        );
      } else {
        review.helpfulBy.push(userId);
      }
      review.helpful = review.helpfulBy.length;
    } else if (parsed.data.action === "report") {
      if (review.userId.toString() === session.userId) {
        return NextResponse.json(
          { success: false, message: "You cannot report your own review" },
          { status: 400 }
        );
      }

      review.reports ??= [];
      const alreadyReported = review.reports.some(
        (report: { userId: mongoose.Types.ObjectId }) =>
          report.userId.toString() === session.userId
      );
      if (alreadyReported) {
        return NextResponse.json(
          { success: false, message: "You already reported this review" },
          { status: 409 }
        );
      }

      review.reports.push({
        createdAt: new Date(),
        reason: parsed.data.reason,
        userId: new mongoose.Types.ObjectId(session.userId),
      });
      audit = {
        action: "reported",
        previousVisibility: review.isVisible,
        reason: parsed.data.reason,
        resultingVisibility: review.isVisible,
      };
    } else if (parsed.data.action === "respond") {
      if (
        session.role !== "vet" ||
        review.vetId.toString() !== session.userId
      ) {
        return NextResponse.json(
          { success: false, message: "Only the reviewed vet can respond" },
          { status: 403 }
        );
      }

      review.response = {
        respondedAt: new Date(),
        vetResponse: parsed.data.response,
      };
    } else {
      if (session.role !== "mod" && session.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Only moderators can review content" },
          { status: 403 }
        );
      }

      if (parsed.data.action === "hide") {
        const previousVisibility = review.isVisible;
        review.isVisible = false;
        review.flagReason = parsed.data.reason;
        review.flaggedBy = session.userId;
        audit = {
          action: "hidden",
          previousVisibility,
          reason: parsed.data.reason,
          resultingVisibility: false,
        };
      } else {
        const previousVisibility = review.isVisible;
        review.isVisible = true;
        review.flagReason = undefined;
        review.flaggedBy = undefined;
        review.reports = [];
        audit = {
          action: "restored",
          previousVisibility,
          resultingVisibility: true,
        };
      }
    }

    await review.save();
    await Promise.all([
      syncVetReviewStats(review.vetId),
      audit
        ? ReviewAudit.create({
            ...audit,
            actorId: session.userId,
            reviewId: review._id,
          })
        : Promise.resolve(),
      parsed.data.action === "report"
        ? notifyRoles({
            body: `A review was reported: ${parsed.data.reason}`,
            link: "/mod/flags",
            roles: ["mod"],
            title: "Review reported",
            type: "review",
          })
        : Promise.resolve(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        helpful: review.helpful,
        helpfulByCurrentUser: review.helpfulBy.some(
          (id: mongoose.Types.ObjectId) => id.toString() === session.userId
        ),
      },
      message:
        parsed.data.action === "report"
          ? "Review reported"
          : parsed.data.action === "helpful"
            ? "Helpful vote updated"
            : "Review updated",
    });
  } catch (error) {
    console.error("[reviews/id] PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update review" },
      { status: 500 }
    );
  }
}
