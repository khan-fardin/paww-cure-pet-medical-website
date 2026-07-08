import type { Metadata } from "next";
import { AlertTriangle, Star } from "lucide-react";

import { ReviewModerationActions } from "@/components/mod/ReviewModerationActions";
import { dbConnect } from "@/lib/db/connect";
import { Review } from "@/lib/db/models/Review";
import "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "Review Moderation | pawwcure",
};

type ModerationReview = {
  _id: { toString(): string };
  comment: string;
  createdAt: Date;
  flagReason?: string;
  isVisible: boolean;
  rating: number;
  reports?: { createdAt: Date; reason: string }[];
  title: string;
  userId?: { email?: string; name?: string };
  vetId?: { email?: string; name?: string };
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
      {children}
    </div>
  );
}

export default async function FlagsPage() {
  await dbConnect();

  const reviews = (await Review.find({})
    .populate("vetId", "name email")
    .populate("userId", "name email")
    .sort({ isVisible: 1, createdAt: -1 })
    .limit(100)
    .lean()) as unknown as ModerationReview[];

  const hidden = reviews.filter((review) => !review.isVisible).length;
  const reported = reviews.filter((review) => review.reports?.length).length;

  return (
    <section className="space-y-8">
      <div>
        <div className="mb-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
          Review moderation
        </div>
        <h1 className="text-3xl font-bold">User Feedback</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Review real consultation feedback. Hide abusive content while keeping
          honest negative experiences visible.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Metric label="Total reviews" value={reviews.length} />
        <Metric label="Reported" value={reported} />
        <Metric label="Hidden" value={hidden} />
        <Metric label="Visible" value={reviews.length - hidden} />
      </div>

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review._id.toString()}>
              <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        review.isVisible
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {review.isVisible ? "visible" : "hidden"}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        className={`h-4 w-4 ${
                          index < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                        key={index}
                      />
                    ))}
                  </div>
                  <h2 className="mt-3 text-xl font-bold">{review.title}</h2>
                  <p className="mt-2 leading-relaxed text-slate-600">
                    {review.comment}
                  </p>

                  <div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                    <p>
                      User: {review.userId?.name ?? "Unknown"} /{" "}
                      {review.userId?.email ?? "No email"}
                    </p>
                    <p>
                      Vet: {review.vetId?.name ?? "Unknown"} /{" "}
                      {review.vetId?.email ?? "No email"}
                    </p>
                  </div>

                  {!review.isVisible && review.flagReason ? (
                    <div className="mt-4 flex gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {review.flagReason}
                    </div>
                  ) : null}
                  {review.reports?.length ? (
                    <div className="mt-4 rounded-2xl bg-amber-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        {review.reports.length} user report
                        {review.reports.length === 1 ? "" : "s"}
                      </p>
                      <div className="mt-2 space-y-1">
                        {review.reports.slice(-3).map((report, index) => (
                          <p
                            className="text-sm text-amber-900"
                            key={`${review._id.toString()}-${index}`}
                          >
                            {report.reason}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[2rem] bg-slate-50 p-4">
                  <ReviewModerationActions
                    isVisible={review.isVisible}
                    reviewId={review._id.toString()}
                  />
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="font-bold text-slate-700">No reviews submitted yet</p>
          </Card>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
