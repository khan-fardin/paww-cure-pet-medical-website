"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneCall } from "lucide-react";

export function StartVetCallButton({
  consultationId,
  disabled = false,
}: {
  consultationId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  async function startCall() {
    setIsStarting(true);
    setError("");

    const response = await fetch(`/api/consultations/${consultationId}/room`, {
      credentials: "include",
      method: "POST",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;
      setError(payload?.message ?? "Could not start the call.");
      setIsStarting(false);
      return;
    }

    router.push(`/consultation/${consultationId}`);
  }

  return (
    <div className="space-y-2">
      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-600/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        disabled={disabled || isStarting}
        onClick={startCall}
        type="button"
      >
        <PhoneCall className="h-4 w-4" />
        {isStarting ? "Starting..." : "Start Call"}
      </button>
      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
