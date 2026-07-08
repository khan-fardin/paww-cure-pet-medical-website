"use client";

import { useState } from "react";
import { Flag, ThumbsUp, X } from "lucide-react";

export function PublicReviewActions({
  helpful,
  initiallyHelpful = false,
  reviewId,
}: {
  helpful: number;
  initiallyHelpful?: boolean;
  reviewId: string;
}) {
  const [helpfulCount, setHelpfulCount] = useState(helpful);
  const [isHelpful, setIsHelpful] = useState(initiallyHelpful);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function update(body: Record<string, unknown>) {
    setIsSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as {
        data?: { helpful?: number; helpfulByCurrentUser?: boolean };
        message?: string;
        success?: boolean;
      };
      if (!response.ok || !payload.success) {
        throw new Error(
          response.status === 401
            ? "Log in to interact with reviews."
            : payload.message ?? "Could not update review"
        );
      }

      if (body.action === "helpful") {
        setHelpfulCount(payload.data?.helpful ?? helpfulCount);
        setIsHelpful(Boolean(payload.data?.helpfulByCurrentUser));
      } else {
        setMessage("Thanks. A moderator will review this report.");
        setReason("");
        setIsReportOpen(false);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <button
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
            isHelpful
              ? "bg-emerald-600 text-white"
              : "bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
          }`}
          disabled={isSaving}
          onClick={() => void update({ action: "helpful" })}
          type="button"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Helpful {helpfulCount > 0 ? helpfulCount : ""}
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          onClick={() => setIsReportOpen(true)}
          type="button"
        >
          <Flag className="h-3.5 w-3.5" />
          Report
        </button>
        {message ? (
          <p className="w-full text-xs font-semibold text-slate-500">{message}</p>
        ) : null}
      </div>

      {isReportOpen ? (
        <div className="fixed inset-0 z-[210] flex items-end bg-slate-950/40 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                  Report review
                </p>
                <h2 className="mt-1 text-xl font-bold">What is the problem?</h2>
              </div>
              <button
                aria-label="Close report dialog"
                className="rounded-full bg-slate-100 p-2 text-slate-500"
                onClick={() => setIsReportOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              className="mt-5 min-h-28 w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-red-400"
              maxLength={300}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Spam, harassment, private information, or another concern..."
              value={reason}
            />
            <button
              className="mt-4 w-full rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white disabled:bg-slate-300"
              disabled={isSaving || reason.trim().length < 5}
              onClick={() => void update({ action: "report", reason })}
              type="button"
            >
              {isSaving ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
