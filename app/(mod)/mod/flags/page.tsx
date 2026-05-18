import type { Metadata } from "next";
import { AlertTriangle, Flag, Trash2 } from "lucide-react";

import { dbConnect } from "@/lib/db/connect";
import { Review } from "@/lib/db/models/Review";
import { VetProfile } from "@/lib/db/models/VetProfile";
import { User } from "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "Flagged Content | pawwcure",
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

export default async function FlagsPage() {
  await dbConnect();

  const flaggedReviews = await Review.find({ isVisible: false })
    .populate("vetId", "clinicName")
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  const formattedFlags = flaggedReviews.map((flag: any) => ({
    id: flag._id.toString(),
    vetName: (flag.vetId as any)?.clinicName || "Unknown Clinic",
    reviewText: flag.comment,
    rating: flag.rating,
    title: flag.title,
    flagReason: flag.flagReason || "Content review required",
    flaggedBy: flag.flaggedBy || "Moderator review",
    date: new Date(flag.createdAt).toLocaleDateString(),
    ownerName: (flag.userId as any)?.name || "Anonymous",
  }));

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Flagged Content</h1>
        <p className="mt-2 text-slate-500">
          Review user reports and take action on inappropriate content
        </p>
      </div>

      <Card>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Flagged Reviews</h2>
          <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700">
            {formattedFlags.length} flagged
          </span>
        </div>

        <div className="space-y-6">
          {formattedFlags.length > 0 ? (
            formattedFlags.map((flag) => (
              <div
                className="rounded-[2rem] border-2 border-red-200 bg-red-50 p-6"
                key={flag.id}
              >
                <div className="flex items-start gap-4 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-red-900">
                          {flag.vetName}&apos;s Review - {flag.rating}★
                        </p>
                        <p className="mt-1 text-sm text-red-800">
                          {flag.flagReason}
                        </p>
                        <p className="mt-1 text-xs text-red-700">
                          Reviewed by: {flag.ownerName}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full">
                        {flag.date}
                      </span>
                    </div>

                    <div className="mt-4 rounded-2xl bg-white p-4">
                      <p className="font-semibold text-slate-900">
                        {flag.title}
                      </p>
                      <p className="mt-2 italic text-slate-700">
                        &quot;{flag.reviewText}&quot;
                      </p>
                      <p className="mt-3 text-xs text-slate-500">
                        Flagged by: {flag.flaggedBy}
                      </p>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button className="flex-1 rounded-2xl border border-red-300 bg-white px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 flex items-center justify-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Remove Review
                      </button>
                      <button className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
                        Dismiss Flag
                      </button>
                      <button className="flex-1 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-100">
                        Escalate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600 font-semibold">No flagged reviews</p>
              <p className="text-sm text-slate-500">
                All reviews are approved and appropriate
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold mb-4">Moderation Guidelines</h2>
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            • <span className="font-bold">Remove if:</span> Harassing, abusive,
            or contains inappropriate content
          </p>
          <p>
            • <span className="font-bold">Dismiss if:</span> Review is honest
            feedback, even if negative
          </p>
          <p>
            • <span className="font-bold">Escalate if:</span> Serious legal
            concerns or repeated abuse
          </p>
        </div>
      </Card>
    </section>
  );
}
