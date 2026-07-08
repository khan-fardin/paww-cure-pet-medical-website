import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquareText, Star } from "lucide-react";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Review } from "@/lib/db/models/Review";
import "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "My Reviews | pawwcure",
};

type UserReview = {
  _id: { toString(): string };
  comment: string;
  communication?: number;
  consultationId: { toString(): string };
  createdAt: Date;
  helpful: number;
  isVisible: boolean;
  professionalism?: number;
  punctuality?: number;
  rating: number;
  response?: { vetResponse?: string };
  title: string;
  vetId?: { name?: string };
};

export default async function MyReviewsPage() {
  const session = await getSession();
  if (!session) redirect("/login?returnUrl=/my-reviews");
  if (session.role !== "user") redirect("/dashboard");

  await dbConnect();
  const reviews = (await Review.find({ userId: session.userId })
    .populate("vetId", "name")
    .sort({ createdAt: -1 })
    .lean()) as unknown as UserReview[];

  return (
    <section className="space-y-8">
      <div>
        <div className="mb-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          Your feedback
        </div>
        <h1 className="text-3xl font-bold sm:text-4xl">My Reviews</h1>
        <p className="mt-2 text-slate-500">
          Reviews you submitted after verified consultations.
        </p>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-7"
              key={review._id.toString()}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        review.isVisible
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {review.isVisible ? "published" : "under review"}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-bold">{review.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {review.vetId?.name ?? "Veterinarian"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
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
              </div>

              <p className="mt-4 leading-relaxed text-slate-600">
                {review.comment}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Score label="Communication" value={review.communication} />
                <Score label="Professional" value={review.professionalism} />
                <Score label="Punctuality" value={review.punctuality} />
              </div>

              {review.response?.vetResponse ? (
                <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Vet response
                  </p>
                  <p className="mt-2 text-sm text-emerald-950">
                    {review.response.vetResponse}
                  </p>
                </div>
              ) : null}

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <p className="text-xs font-bold text-slate-400">
                  {review.helpful} helpful vote{review.helpful === 1 ? "" : "s"}
                </p>
                <Link
                  className="text-sm font-bold text-emerald-700"
                  href={`/consultation/${review.consultationId.toString()}/summary`}
                >
                  View consultation
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center">
          <MessageSquareText className="mx-auto h-9 w-9 text-slate-300" />
          <p className="mt-3 font-bold text-slate-700">No reviews yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Completed consultation reviews will appear here.
          </p>
        </div>
      )}
    </section>
  );
}

function Score({ label, value }: { label: string; value?: number }) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 p-3 text-center">
      <p className="truncate text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-bold text-slate-800">{value ?? "-"} / 5</p>
    </div>
  );
}
