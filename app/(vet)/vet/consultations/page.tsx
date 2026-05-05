import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, MessageSquare } from "lucide-react";

import { demoConsultations } from "@/lib/demo/userContent";

export const metadata: Metadata = {
  title: "My Consultations | pawwcure",
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

export default function VetConsultationsPage() {
  const upcomingConsultations = demoConsultations.filter(
    (c) => c.status === "Confirmed"
  );
  const completedConsultations = demoConsultations.filter(
    (c) => c.status === "Completed"
  );

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Consultations</h1>
        <p className="mt-2 text-slate-500">
          Manage your consultations and patient records
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Upcoming Sessions</h2>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700">
              {upcomingConsultations.length} sessions
            </span>
          </div>

          <div className="space-y-4">
            {upcomingConsultations.map((consultation) => (
              <div
                className="flex items-start justify-between gap-4 rounded-[2rem] border border-slate-100 p-5"
                key={consultation.id}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    <p className="text-sm font-bold text-slate-500">
                      {consultation.scheduledAt}
                    </p>
                  </div>
                  <h3 className="mt-2 text-lg font-bold">{consultation.petName}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {consultation.type} consultation
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    className="rounded-2xl bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700"
                    href={consultation.href}
                  >
                    Join
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Completed Sessions</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              {completedConsultations.length} completed
            </span>
          </div>

          <div className="space-y-4">
            {completedConsultations.map((consultation) => (
              <div
                className="flex items-start justify-between gap-4 rounded-[2rem] border border-slate-100 p-5"
                key={consultation.id}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <p className="text-sm font-bold text-slate-500">
                      {consultation.scheduledAt}
                    </p>
                  </div>
                  <h3 className="mt-2 text-lg font-bold">{consultation.petName}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {consultation.type} consultation
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                    href={`/vet/consultations/${consultation.id}/record`}
                  >
                    View Record
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
