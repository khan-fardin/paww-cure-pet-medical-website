import type { Metadata } from "next";
import Link from "next/link";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { demoConsultations } from "@/lib/demo/userContent";

export const metadata: Metadata = {
  title: "Consultations | pawwcure",
};

export default function ConsultationsPage() {
  return (
    <UserPageScaffold
      actionHref="/vets"
      actionLabel="Book New Consult"
      description="Track upcoming, pending, and completed consultations. Backend status, payment confirmation, and room events will connect here later."
      eyebrow="User consultations"
      title="Consultations"
    >
      <div className="grid gap-5">
        {demoConsultations.map((consultation) => (
          <Link
            className="grid gap-4 rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:grid-cols-[1fr_1fr_auto]"
            href={consultation.href}
            key={consultation.id}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {consultation.type} consultation
              </p>
              <h2 className="mt-2 text-xl font-bold">{consultation.vetName}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Pet: {consultation.petName}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Scheduled
              </p>
              <p className="mt-2 font-bold">{consultation.scheduledAt}</p>
            </div>
            <span className="h-fit rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              {consultation.status}
            </span>
          </Link>
        ))}
      </div>
    </UserPageScaffold>
  );
}
