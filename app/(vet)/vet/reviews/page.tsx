import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Flag, Star } from "lucide-react";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Review } from "@/lib/db/models/Review";
import "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "My Reviews | pawwcure",
};

type ReviewRow = {
  _id: { toString(): string };
  comment: string;
  createdAt: Date;
  rating: number;
  title: string;
  userId?: {
    name?: string;
  };
};

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default async function ReviewsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?returnUrl=/vet/reviews");
  }

  if (session.role !== "vet") {
    redirect("/dashboard");
  }

  await dbConnect();

  const reviews = await Review.find({ vetId: session.userId, isVisible: true })
    .populate("userId", "name")
    .sort({ createdAt: -1 })
    .lean<ReviewRow[]>();

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Reviews</h1>
        <p className="mt-2 text-slate-500">
          Reviews submitted for consultations assigned to you.
        </p>
      </div>

      <Card>
        <div className="text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                className={`h-6 w-6 ${
                  index < Math.floor(Number(avgRating))
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                }`}
                key={index}
              />
            ))}
          </div>
          <p className="text-5xl font-bold">{avgRating}</p>
          <p className="mt-2 text-slate-500">
            Based on {reviews.length} reviews
          </p>
        </div>
      </Card>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <p className="font-bold text-slate-700">No reviews yet</p>
            <p className="mt-2 text-sm text-slate-500">
              User feedback will appear after completed consultations.
            </p>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review._id.toString()}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div>
                    <p className="font-bold">
                      {review.userId?.name ?? "User"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        className={`h-4 w-4 ${
                          index < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                        key={index}
                      />
                    ))}
                  </div>

                  <p className="mt-3 font-bold text-slate-900">
                    {review.title}
                  </p>
                  <p className="mt-2 text-slate-600">{review.comment}</p>
                </div>

                <button
                  className="text-slate-400 transition hover:text-amber-500"
                  title="Flag as inappropriate"
                  type="button"
                >
                  <Flag className="h-5 w-5" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
