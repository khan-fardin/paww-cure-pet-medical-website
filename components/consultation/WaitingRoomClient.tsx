"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader, Video } from "lucide-react";

type ConsultationStatus = "scheduled" | "ongoing" | "completed" | "cancelled" | "no-show";

export function WaitingRoomClient({ consultationId }: { consultationId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<ConsultationStatus>("scheduled");
  const [message, setMessage] = useState("Waiting for your vet to start the call.");

  useEffect(() => {
    let ignore = false;

    async function checkStatus() {
      const response = await fetch(`/api/consultations/${consultationId}`, {
        credentials: "include",
      });
      const payload = (await response.json().catch(() => null)) as
        | { data?: { status?: ConsultationStatus }; message?: string }
        | null;

      if (ignore) return;

      if (!response.ok) {
        setMessage(payload?.message ?? "Could not check consultation status.");
        return;
      }

      const nextStatus = payload?.data?.status ?? "scheduled";
      setStatus(nextStatus);

      if (nextStatus === "ongoing") {
        router.push(`/consultation/${consultationId}`);
      } else if (nextStatus === "cancelled" || nextStatus === "no-show") {
        setMessage("This consultation is no longer active.");
      } else if (nextStatus === "completed") {
        setMessage("This consultation has already been completed.");
      }
    }

    void checkStatus();
    const interval = window.setInterval(checkStatus, 5000);

    return () => {
      ignore = true;
      window.clearInterval(interval);
    };
  }, [consultationId, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-6 py-16">
      <section className="w-full max-w-3xl rounded-[3rem] bg-white p-8 text-center shadow-sm ring-1 ring-slate-100 md:p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-emerald-50 text-emerald-600">
          {status === "ongoing" ? (
            <Video className="h-8 w-8" />
          ) : (
            <Loader className="h-8 w-8 animate-spin" />
          )}
        </div>
        <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          Waiting room
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Your vet will start the call.
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-slate-500">
          {message} This page checks every few seconds and opens the room
          automatically when the consultation starts.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="rounded-2xl border border-slate-200 px-6 py-4 text-sm font-bold text-slate-600"
            href="/consultations"
          >
            Back to Consultations
          </Link>
        </div>
      </section>
    </main>
  );
}
