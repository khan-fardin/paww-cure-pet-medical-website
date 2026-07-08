import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { Document } from "@/lib/db/models/Document";
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
  _id: mongoose.Types.ObjectId;
  consultationId: mongoose.Types.ObjectId;
  medications?: {
    dosage: string;
    duration: string;
    frequency: string;
    name: string;
  }[];
};

type RecordDocument = {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  mimeType: string;
  relatedConsultationId?: mongoose.Types.ObjectId;
  title: string;
  type: string;
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

  const [prescriptions, documents] = await Promise.all([
    Prescription.find({
      consultationId: { $in: records.map((record) => record._id) },
    }).lean<PrescriptionItem[]>(),
    Document.find({ petId, userId: session.userId })
      .sort({ createdAt: -1 })
      .lean<RecordDocument[]>(),
  ]);

  const prescriptionByConsultation = new Map(
    prescriptions.map((prescription) => [
      prescription.consultationId.toString(),
      prescription,
    ])
  );
  const documentsByConsultation = new Map<string, RecordDocument[]>();
  for (const document of documents) {
    const key = document.relatedConsultationId?.toString() ?? "general";
    documentsByConsultation.set(key, [
      ...(documentsByConsultation.get(key) ?? []),
      document,
    ]);
  }

  return (
    <UserPageScaffold
      actionHref="/documents"
      actionLabel="Upload Document"
      description={`Consultation summaries, prescriptions, and follow-up notes for ${pet.name}.`}
      eyebrow="Health records"
      title={`${pet.name} records`}
    >
      <div className="relative grid gap-5 before:absolute before:bottom-8 before:left-5 before:top-8 before:w-px before:bg-emerald-100 md:before:left-7">
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
            const attachedDocuments =
              documentsByConsultation.get(record._id.toString()) ?? [];

            return (
              <article
                className="relative ml-10 rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm md:ml-14"
                key={record._id.toString()}
              >
                <div className="absolute -left-[2.35rem] top-8 h-4 w-4 rounded-full border-4 border-white bg-emerald-500 shadow-sm md:-left-[2.95rem]" />
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
                    {prescription ? (
                      <Link
                        className="mt-3 inline-flex text-sm font-bold text-emerald-700"
                        href={`/api/prescriptions/${prescription._id.toString()}/pdf`}
                      >
                        Download prescription PDF
                      </Link>
                    ) : null}
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
                {record.followUpDueDate ? (
                  <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">
                    Follow-up due{" "}
                    {new Date(record.followUpDueDate).toLocaleDateString()}
                  </div>
                ) : null}
                {attachedDocuments.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Attachments
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {attachedDocuments.map((document) => (
                        <Link
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600"
                          href={`/api/documents/${document._id.toString()}/download`}
                          key={document._id.toString()}
                        >
                          {document.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </UserPageScaffold>
  );
}
