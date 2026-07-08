import mongoose from "mongoose";

import { Review } from "@/lib/db/models/Review";
import { VetProfile } from "@/lib/db/models/VetProfile";

export async function syncVetReviewStats(vetUserId: mongoose.Types.ObjectId) {
  const [stats] = await Review.aggregate<{
    averageRating: number;
    totalReviews: number;
  }>([
    {
      $match: {
        isVisible: true,
        vetId: vetUserId,
      },
    },
    {
      $group: {
        _id: "$vetId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  await VetProfile.findOneAndUpdate(
    { userId: vetUserId },
    {
      $set: {
        averageRating: stats
          ? Math.round(stats.averageRating * 10) / 10
          : 0,
        totalReviews: stats?.totalReviews ?? 0,
      },
    }
  );
}
