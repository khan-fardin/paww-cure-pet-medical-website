import type { Metadata } from "next";
import { History, ShieldCheck } from "lucide-react";

import { dbConnect } from "@/lib/db/connect";
import { ReviewAudit } from "@/lib/db/models/ReviewAudit";
import "@/lib/db/models/Review";
import "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "Review Audit | pawwcure Admin",
};

type AuditRow = {
  _id: { toString(): string };
  action: "reported" | "hidden" | "restored";
  actorId?: { email?: string; name?: string; role?: string };
  createdAt: Date;
  previousVisibility: boolean;
  reason?: string;
  resultingVisibility: boolean;
  reviewId?: {
    comment?: string;
    rating?: number;
    title?: string;
  };
};

export default async function ReviewAuditPage() {
  await dbConnect();
  const rows = (await ReviewAudit.find({})
    .populate("actorId", "name email role")
    .populate("reviewId", "title comment rating")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean()) as unknown as AuditRow[];

  return (
    <section className="space-y-8">
      <div>
        <div className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
          Moderation governance
        </div>
        <h1 className="text-3xl font-bold sm:text-4xl">Review Audit History</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Immutable history of reports and moderator visibility decisions.
        </p>
      </div>

      <div className="space-y-4">
        {rows.length > 0 ? (
          rows.map((row) => (
            <article
              className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-7"
              key={row._id.toString()}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                  <History className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      {row.action}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {new Date(row.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-slate-950">
                    {row.reviewId?.title ?? "Deleted or unavailable review"}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {row.reviewId?.comment ?? "Review content unavailable."}
                  </p>
                  <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                    <p>
                      Actor: {row.actorId?.name ?? "Unknown"} /{" "}
                      {row.actorId?.role ?? "role"}
                    </p>
                    <p>
                      Visibility: {row.previousVisibility ? "visible" : "hidden"}{" "}
                      to {row.resultingVisibility ? "visible" : "hidden"}
                    </p>
                    <p>Rating: {row.reviewId?.rating ?? "-"} / 5</p>
                  </div>
                  {row.reason ? (
                    <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">
                      {row.reason}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center">
            <ShieldCheck className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 font-bold text-slate-700">
              No moderation actions yet
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
