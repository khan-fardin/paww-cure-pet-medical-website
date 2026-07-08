"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareReply } from "lucide-react";

export function VetReviewResponse({
  existingResponse,
  reviewId,
}: {
  existingResponse?: string;
  reviewId: string;
}) {
  const router = useRouter();
  const [response, setResponse] = useState(existingResponse ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitResponse() {
    setIsSaving(true);
    setError(null);

    try {
      const result = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "respond", response }),
      });
      const payload = (await result.json()) as { message?: string; success?: boolean };

      if (!result.ok || !payload.success) {
        throw new Error(payload.message ?? "Could not save response");
      }

      router.refresh();
    } catch (responseError) {
      setError(
        responseError instanceof Error
          ? responseError.message
          : "Could not save response"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Public vet response
      </p>
      <textarea
        className="mt-3 min-h-24 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-teal-500"
        maxLength={1000}
        onChange={(event) => setResponse(event.target.value)}
        placeholder="Thank the user or clarify the follow-up professionally."
        value={response}
      />
      <button
        className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300"
        disabled={isSaving || response.trim().length < 3}
        onClick={submitResponse}
        type="button"
      >
        <MessageSquareReply className="h-4 w-4" />
        {isSaving ? "Saving..." : existingResponse ? "Update Response" : "Post Response"}
      </button>
      {error ? <p className="mt-2 text-xs font-bold text-red-600">{error}</p> : null}
    </div>
  );
}
