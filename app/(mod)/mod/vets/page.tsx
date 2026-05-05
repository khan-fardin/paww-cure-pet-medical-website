import type { Metadata } from "next";
import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  X,
} from "lucide-react";

import { demoVets } from "@/lib/demo/publicContent";

export const metadata: Metadata = {
  title: "Vet Verification | pawwcure",
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

export default function VetVerificationPage() {
  const pendingVets = demoVets.slice(0, 2);
  const approvedVets = demoVets.slice(2, 3);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Vet Verification Queue</h1>
        <p className="mt-2 text-slate-500">
          Review vet applications and approve or reject submissions
        </p>
      </div>

      <div className="space-y-6">
        {/* Pending Applications */}
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Pending Applications</h2>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
              {pendingVets.length} pending
            </span>
          </div>

          <div className="space-y-6">
            {pendingVets.map((vet) => (
              <div
                className="rounded-[2rem] border border-slate-100 p-6"
                key={vet.id}
              >
                <div className="grid gap-6 md:grid-cols-[120px_1fr]">
                  <div className="mx-auto">
                    <Image
                      alt={vet.name}
                      className="h-24 w-24 rounded-2xl object-cover"
                      height={96}
                      src={vet.avatar}
                      width={96}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Name
                        </p>
                        <p className="mt-1 font-bold">{vet.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Experience
                        </p>
                        <p className="mt-1 font-bold">
                          {vet.yearsExperience} years
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Education
                        </p>
                        <p className="mt-1 font-bold text-sm">{vet.education}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Consultation Fee
                        </p>
                        <p className="mt-1 font-bold">{vet.consultFee}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Specialties
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {vet.specialties.map((specialty) => (
                          <span
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
                            key={specialty}
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Documents
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                          <FileText className="h-4 w-4" />
                          License
                          <Download className="h-4 w-4 ml-1" />
                        </button>
                        <button className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                          <FileText className="h-4 w-4" />
                          Degree
                          <Download className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </button>
                      <button className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 flex items-center justify-center gap-2">
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                      <button className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
                        Request Info
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Approved Vets */}
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recently Approved</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              {approvedVets.length} approved
            </span>
          </div>

          <div className="space-y-3">
            {approvedVets.map((vet) => (
              <div
                className="flex items-center justify-between rounded-[2rem] bg-emerald-50 p-4"
                key={vet.id}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Image
                    alt={vet.name}
                    className="h-10 w-10 rounded-2xl object-cover"
                    height={40}
                    src={vet.avatar}
                    width={40}
                  />
                  <div>
                    <p className="font-bold text-slate-900">{vet.name}</p>
                    <p className="text-xs text-slate-500">Approved May 1, 2026</p>
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
