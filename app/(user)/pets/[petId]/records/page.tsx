import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { Pet } from "@/lib/db/models/Pet";
import { Prescription } from "@/lib/db/models/Prescription";
import "@/lib/db/models/User";

type PetRecordsPageProps = {
  params: Promise<{ petId: string }>;
};

type RecordItem = {
  _id: mongoose.Types.ObjectId;
  diagnosis?: string;
  followUpDueDate?: Date;
  scheduledAt: Date;
  status: string;
  treatmentPlan?: string;
  vetId: { name?: string } | mongoose.Types.ObjectId;
};

type PrescriptionItem = {
  consultationId: mongoose.Types.ObjectId;
  medications?: {
    dosage: string;
    duration: string;
    frequency: string;
    name: string;
  }[];
};

export const metadata: Metadata = {
  title: "Health Records | pawwcure",
};

export default async function PetRecordsPage({ params }: PetRecordsPageProps) {
  const { petId } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/login?returnUrl=/pets/${petId}/records`);
  }

  if (session.role !== "user") {
    redirect("/dashboard");
  }

  if (!mongoose.Types.ObjectId.isValid(petId)) {
    notFound();
  }

  await dbConnect();

  const pet = await Pet.findOne({ _id: petId, userId: session.userId }).lean<{
    name: string;
  }>();

  if (!pet) {
    notFound();
  }

  const records = await Consultation.find({ petId, userId: session.userId })
    .populate("vetId", "name")
    .sort({ scheduledAt: -1 })
    .lean<RecordItem[]>();

  const prescriptions = await Prescription.find({
    consultationId: { $in: records.map((record) => record._id) },
  }).lean<PrescriptionItem[]>();

  const prescriptionByConsultation = new Map(
    prescriptions.map((prescription) => [
      prescription.consultationId.toString(),
      prescription,
    ])
  );

  return (
    <UserPageScaffold
      actionHref="/documents"
      actionLabel="Upload Document"
      description={`Consultation summaries, prescriptions, and follow-up notes for ${pet.name}.`}
      eyebrow="Health records"
      title={`${pet.name} records`}
    >
      <div className="grid gap-5">
        {records.length === 0 ? (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 p-10 text-center">
            <p className="font-bold text-slate-700">No records yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Completed consultations and prescriptions will appear here.
            </p>
          </div>
        ) : (
          records.map((record) => {
            const prescription = prescriptionByConsultation.get(
              record._id.toString()
            );
            const vet =
              typeof record.vetId === "object" && "name" in record.vetId
                ? record.vetId.name
                : "Vet";

            return (
              <article
                className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm"
                key={record._id.toString()}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {new Date(record.scheduledAt).toLocaleString()}
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-slate-950">
                      {vet}
                    </h2>
                    <p className="mt-1 text-sm capitalize text-slate-500">
                      Status: {record.status}
                    </p>
                  </div>
                  <Link
                    className="rounded-2xl bg-emerald-600 px-5 py-3 text-center text-sm font-bold text-white"
                    href={`/consultation/${record._id.toString()}/summary`}
                  >
                    Open Summary
                  </Link>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Diagnosis
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {record.diagnosis ?? "Waiting for vet record."}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Prescription
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {prescription?.medications?.[0]
                        ? `${prescription.medications[0].name} · ${prescription.medications[0].dosage} · ${prescription.medications[0].frequency}`
                        : "No prescription added yet."}
                    </p>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </UserPageScaffold>
  );
}
