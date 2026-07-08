"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function MarkPayoutPaidButton({ vetId }: { vetId: string }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markPaid() {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/payments/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ vetId }),
      });
      const payload = (await response.json()) as {
        message?: string;
        success?: boolean;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Could not mark payout paid");
      }

      router.refresh();
    } catch (markError) {
      setError(
        markError instanceof Error ? markError.message : "Could not mark paid"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-300"
        disabled={isSaving}
        onClick={markPaid}
        type="button"
      >
        <CheckCircle2 className="h-4 w-4" />
        {isSaving ? "Marking..." : "Mark as Paid"}
      </button>
      {error ? <p className="text-xs font-bold text-red-600">{error}</p> : null}
    </div>
  );
}
