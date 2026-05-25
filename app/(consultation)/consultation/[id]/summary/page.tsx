import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";

import { ReviewForm } from "@/components/consultation/ReviewForm";
import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import "@/lib/db/models/Pet";
import { Prescription } from "@/lib/db/models/Prescription";
import "@/lib/db/models/User";

type ConsultationSummaryPageProps = {
  params: Promise<{ id: string }>;
};

type PopulatedUser = {
  _id: { toString(): string };
  email?: string;
  name?: string;
};

type PopulatedPet = {
  _id: { toString(): string };
  breed?: string;
  name?: string;
  species?: string;
};

type PrescriptionSummary = {
  medications?: {
    dosage: string;
    duration: string;
    frequency: string;
    instructions?: string;
    name: string;
  }[];
};

export const metadata: Metadata = {
  title: "Consultation Summary | pawwcure",
};

function SummaryCard({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-[2rem] bg-slate-50 p-6">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="mt-3 text-sm leading-6 text-slate-600">{children}</div>
    </div>
  );
}

export default async function ConsultationSummaryPage({
  params,
}: ConsultationSummaryPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/login?returnUrl=${encodeURIComponent(`/consultation/${id}/summary`)}`);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  await dbConnect();

  const consultation = await Consultation.findById(id)
    .populate("petId", "breed name species")
    .populate("userId", "email name")
    .populate("vetId", "email name")
    .lean();

  if (!consultation) {
    notFound();
  }

  const user = consultation.userId as unknown as PopulatedUser;
  const vet = consultation.vetId as unknown as PopulatedUser;
  const pet = consultation.petId as unknown as PopulatedPet;
  const isUser = user._id.toString() === session.userId;
  const isVet = vet._id.toString() === session.userId;
  const isStaff = session.role === "admin" || session.role === "mod";

  if (!isUser && !isVet && !isStaff) {
    notFound();
  }

  const prescription = await Prescription.findOne({
    consultationId: id,
  }).lean<PrescriptionSummary>();

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-6 py-16">
      <section className="mx-auto max-w-5xl rounded-[3rem] bg-white p-8 shadow-sm ring-1 ring-slate-100 md:p-12">
        <div className="mb-5 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          Consultation summary
        </div>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {pet.name ?? "Pet"} with {vet.name ?? "Vet"}
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-slate-500">
          Review the call status, treatment notes, prescription, and follow-up
          plan after the session ends.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <SummaryCard label="Status">
            <p className="font-bold capitalize text-slate-950">
              {consultation.status}
            </p>
            <p className="mt-1">
              {new Date(consultation.scheduledAt).toLocaleString()}
            </p>
          </SummaryCard>
          <SummaryCard label="Pet">
            <p className="font-bold text-slate-950">{pet.name ?? "Pet"}</p>
            <p className="mt-1 capitalize">
              {pet.species ?? "pet"} · {pet.breed ?? "Mixed breed"}
            </p>
          </SummaryCard>
          <SummaryCard label="Vet">
            <p className="font-bold text-slate-950">{vet.name ?? "Vet"}</p>
            <p className="mt-1">{vet.email ?? "No email"}</p>
          </SummaryCard>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <SummaryCard label="Diagnosis">
            {consultation.diagnosis ? (
              <p>{consultation.diagnosis}</p>
            ) : (
              <p className="text-slate-400">
                Diagnosis will appear after the vet writes the record.
              </p>
            )}
          </SummaryCard>
          <SummaryCard label="Treatment">
            {consultation.treatmentPlan ? (
              <p>{consultation.treatmentPlan}</p>
            ) : (
              <p className="text-slate-400">
                Treatment plan will appear after the vet writes the record.
              </p>
            )}
          </SummaryCard>
        </div>

        <div className="mt-6 rounded-[2rem] bg-slate-50 p-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Prescription
          </p>
          {prescription?.medications?.length ? (
            <div className="mt-4 grid gap-3">
              {prescription.medications.map((medication) => (
                <div
                  className="rounded-2xl bg-white p-4 text-sm shadow-sm"
                  key={`${medication.name}-${medication.dosage}`}
                >
                  <p className="font-bold text-slate-950">{medication.name}</p>
                  <p className="mt-1 text-slate-500">
                    {medication.dosage} · {medication.frequency} ·{" "}
                    {medication.duration}
                  </p>
                  {medication.instructions ? (
                    <p className="mt-2 text-slate-500">
                      {medication.instructions}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              No prescription has been added yet.
            </p>
          )}
        </div>

        {session.role === "user" ? (
          <div className="mt-6">
            <ReviewForm
              consultationId={id}
              disabled={consultation.status !== "completed"}
            />
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            className="rounded-2xl bg-emerald-600 px-6 py-4 text-center text-sm font-bold text-white"
            href={session.role === "vet" ? "/vet/consultations" : "/dashboard"}
          >
            {session.role === "vet" ? "Back to Consultations" : "Back to Dashboard"}
          </Link>
          {session.role === "vet" ? (
            <Link
              className="rounded-2xl border border-slate-200 px-6 py-4 text-center text-sm font-bold text-slate-600"
              href={`/vet/consultations/${id}/record`}
            >
              Write Record
            </Link>
          ) : (
            <Link
              className="rounded-2xl border border-slate-200 px-6 py-4 text-center text-sm font-bold text-slate-600"
              href={`/pets/${pet._id.toString()}/records`}
            >
              View Pet Records
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
