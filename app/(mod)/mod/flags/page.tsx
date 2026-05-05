import type { Metadata } from "next";
import { AlertTriangle, Flag, Trash2 } from "lucide-react";

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

export default function FlagsPage() {
  const flaggedReviews = [
    {
      id: "flag-001",
      vetName: "Dr. Amina Rahman",
      reviewText:
        "Terrible vet! She did not help at all. Complete waste of money and time.",
      flagReason: "Inappropriate language / Harassment",
      flaggedBy: "System - Severity High",
      date: "May 2, 2026",
    },
    {
      id: "flag-002",
      vetName: "Dr. Samuel Das",
      reviewText:
        "Good vet but could be better with puppy training advice.",
      flagReason: "Suspected competitor spam",
      flaggedBy: "User report",
      date: "May 1, 2026",
    },
  ];

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
            {flaggedReviews.length} flagged
          </span>
        </div>

        <div className="space-y-6">
          {flaggedReviews.map((flag) => (
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
                        {flag.vetName}'s Review
                      </p>
                      <p className="mt-1 text-sm text-red-800">{flag.flagReason}</p>
                    </div>
                    <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full">
                      {flag.date}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-4">
                    <p className="italic text-slate-700">"{flag.reviewText}"</p>
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
          ))}
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
