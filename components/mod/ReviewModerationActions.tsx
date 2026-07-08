"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export function ReviewModerationActions({
  isVisible,
  reviewId,
}: {
  isVisible: boolean;
  reviewId: string;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateReview() {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isVisible
            ? {
                action: "hide",
                reason: reason || "Hidden after moderator review",
              }
            : { action: "restore" }
        ),
      });
      const payload = (await response.json()) as {
        message?: string;
        success?: boolean;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Could not update review");
      }

      router.refresh();
    } catch (moderationError) {
      setError(
        moderationError instanceof Error
          ? moderationError.message
          : "Could not update review"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      {isVisible ? (
        <input
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason for hiding..."
          value={reason}
        />
      ) : null}
      <button
        className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300 ${
          isVisible ? "bg-red-600" : "bg-emerald-600"
        }`}
        disabled={isSaving}
        onClick={updateReview}
        type="button"
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {isSaving ? "Saving..." : isVisible ? "Hide Review" : "Restore Review"}
      </button>
      {error ? <p className="text-xs font-bold text-red-600">{error}</p> : null}
    </div>
  );
}
