"use client";

import Link from "next/link";
import { Stethoscope, AlertCircle } from "lucide-react";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { useConsultations } from "@/lib/hooks/useConsultations";

export default function ConsultationsPage() {
  const { consultations, loading, error, refetch } = useConsultations();

  const statusColors: Record<string, string> = {
    scheduled: "bg-emerald-50 text-emerald-700",
    ongoing: "bg-blue-50 text-blue-700",
    completed: "bg-slate-50 text-slate-700",
    cancelled: "bg-red-50 text-red-700",
    "no-show": "bg-amber-50 text-amber-700",
  };

  return (
    <UserPageScaffold
      actionHref="/vets"
      actionLabel="Book New Consult"
      description="Track upcoming, pending, and completed consultations with real-time status updates."
      eyebrow="User consultations"
      title="Consultations"
    >
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex items-center gap-3 mb-6">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <p className="font-bold text-red-900">Failed to load consultations</p>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={refetch}
              className="mt-2 text-sm font-bold text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="grid gap-4 rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm animate-pulse md:grid-cols-[1fr_1fr_auto]"
            >
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-2/3" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-1/2" />
              </div>
              <div className="h-8 bg-slate-200 rounded-full w-24" />
            </div>
          ))}
        </div>
      ) : consultations.length === 0 ? (
        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-300 p-12 text-center">
          <Stethoscope className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No consultations yet</h3>
          <p className="mt-2 text-slate-500">
            Book your first consultation with a verified veterinarian
          </p>
          <Link
            href="/vets"
            className="mt-6 inline-flex rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition"
          >
            Browse Vets
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {consultations.map((consultation) => (
            <Link
              className="grid gap-4 rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:grid-cols-[1fr_1fr_auto]"
              href={
                consultation.status === "scheduled"
                  ? `/consultation/${consultation._id}/waiting`
                  : `/consultation/${consultation._id}`
              }
              key={consultation._id}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {consultation.type} consultation
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  {consultation.vetId?.name || "Vet"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pet: {consultation.petId?.name || "Pet"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Scheduled
                </p>
                <p className="mt-2 font-bold">
                  {new Date(consultation.scheduledAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(consultation.scheduledAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span
                className={`h-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  statusColors[consultation.status] || "bg-slate-50 text-slate-700"
                }`}
              >
                {consultation.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </UserPageScaffold>
  );
}
