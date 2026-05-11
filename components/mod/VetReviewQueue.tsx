"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, X } from "lucide-react";

export type VetApplicationItem = {
  id: string;
  avatar?: string;
  bio?: string;
  clinicCity: string;
  consultationFee: number;
  createdAt: string;
  degreeDocumentName?: string;
  email: string;
  experience: number;
  isVerified: boolean;
  licenseDocumentName?: string;
  licenseNumber: string;
  name: string;
  phone?: string;
  rejectionReason?: string;
  specializations: string[];
  status: "draft" | "submitted" | "approved" | "rejected";
};

function statusClass(status: VetApplicationItem["status"]) {
  if (status === "approved") return "bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-700";
}

export function VetReviewQueue({ vets }: { vets: VetApplicationItem[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function updateStatus(
    vetId: string,
    action: "approve" | "reject"
  ) {
    setBusyId(vetId);
    setMessage(null);

    const response = await fetch(`/api/vets/${vetId}`, {
      body: JSON.stringify({
        action,
        rejectionReason:
          action === "reject"
            ? "Application needs clearer credential documents."
            : undefined,
      }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });

    const payload = (await response.json()) as { message?: string };
    setBusyId(null);

    if (!response.ok) {
      setMessage(payload.message ?? "Could not update vet application.");
      return;
    }

    setMessage(
      action === "approve"
        ? "Vet approved and public profile activated."
        : "Vet application rejected."
    );
    startTransition(() => router.refresh());
  }

  const submitted = vets.filter((vet) => vet.status === "submitted");
  const reviewed = vets.filter((vet) => vet.status !== "submitted");

  return (
    <div className="space-y-6">
      {message ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {message}
        </div>
      ) : null}

      <section className="rounded-[2.5rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Pending Applications</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review credentials, documents, fees, and profile details.
            </p>
          </div>
          <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
            {submitted.length} pending
          </span>
        </div>

        <div className="space-y-5">
          {submitted.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-200 p-8 text-center text-sm font-bold text-slate-500">
              No submitted vet applications waiting right now.
            </div>
          ) : (
            submitted.map((vet) => (
              <article
                className="rounded-[2rem] border border-slate-100 p-4 sm:p-6"
                key={vet.id}
              >
                <div className="grid gap-5 lg:grid-cols-[88px_1fr]">
                  <Image
                    alt={vet.name}
                    className="h-20 w-20 rounded-3xl object-cover"
                    height={80}
                    src={vet.avatar ?? `https://i.pravatar.cc/160?u=${vet.id}`}
                    width={80}
                  />

                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <Info label="Name" value={vet.name} />
                      <Info label="Email" value={vet.email} />
                      <Info label="License" value={vet.licenseNumber} />
                      <Info label="Fee" value={`BDT ${vet.consultationFee}`} />
                    </div>

                    <p className="max-w-4xl text-sm leading-relaxed text-slate-500">
                      {vet.bio || "No profile bio was supplied yet."}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {vet.specializations.map((specialty) => (
                        <span
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
                          key={specialty}
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <DocButton label={vet.licenseDocumentName ?? "License"} />
                      <DocButton label={vet.degreeDocumentName ?? "Degree"} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={busyId === vet.id || isPending}
                        onClick={() => void updateStatus(vet.id, "approve")}
                        type="button"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={busyId === vet.id || isPending}
                        onClick={() => void updateStatus(vet.id, "reject")}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Reviewed Vets</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {reviewed.length} records
          </span>
        </div>

        <div className="grid gap-3">
          {reviewed.map((vet) => (
            <div
              className="flex flex-col gap-3 rounded-[2rem] bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              key={vet.id}
            >
              <div>
                <p className="font-bold text-slate-900">{vet.name}</p>
                <p className="text-sm text-slate-500">{vet.email}</p>
              </div>
              <span
                className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(vet.status)}`}
              >
                {vet.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function DocButton({ label }: { label: string }) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
      type="button"
    >
      <FileText className="h-4 w-4" />
      {label}
    </button>
  );
}
