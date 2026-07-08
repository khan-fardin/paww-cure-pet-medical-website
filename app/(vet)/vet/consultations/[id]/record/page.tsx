import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";

import { ConsultationRecordForm } from "@/components/vet/ConsultationRecordForm";
import { RecordAttachmentUploader } from "@/components/vet/RecordAttachmentUploader";
import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import "@/lib/db/models/Pet";
import "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "Write Consultation Record | pawwcure",
};

type PopulatedPet = {
  _id?: { toString(): string };
  breed?: string;
  name?: string;
  species?: string;
};

type PopulatedUser = {
  email?: string;
  name?: string;
};

type ConsultationRecordView = {
  _id: mongoose.Types.ObjectId;
  diagnosis?: string;
  followUpDueDate?: Date;
  notes?: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  petId: PopulatedPet | mongoose.Types.ObjectId;
  scheduledAt: Date;
  treatmentPlan?: string;
  type: "video" | "audio" | "chat" | "in-clinic";
  userId: PopulatedUser | mongoose.Types.ObjectId;
};

function isPopulatedPet(value: ConsultationRecordView["petId"]): value is PopulatedPet {
  return typeof value === "object" && value !== null && "name" in value;
}

function isPopulatedUser(
  value: ConsultationRecordView["userId"]
): value is PopulatedUser {
  return typeof value === "object" && value !== null && "email" in value;
}

export default async function WriteRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/login?returnUrl=/vet/consultations/${id}/record`);
  }

  if (session.role !== "vet") {
    redirect("/dashboard");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  await dbConnect();

  const consultation = await Consultation.findOne({
    _id: id,
    vetId: session.userId,
  })
    .populate("petId", "breed name species")
    .populate("userId", "email name")
    .lean<ConsultationRecordView>();

  if (!consultation) {
    notFound();
  }

  const pet = isPopulatedPet(consultation.petId)
    ? {
        breed: consultation.petId.breed ?? "Mixed breed",
        name: consultation.petId.name ?? "Pet",
        species: consultation.petId.species ?? "pet",
      }
    : { breed: "Mixed breed", name: "Pet", species: "pet" };

  const user = isPopulatedUser(consultation.userId)
    ? {
        email: consultation.userId.email ?? "No email",
        name: consultation.userId.name ?? "User",
      }
    : { email: "No email", name: "User" };

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Consultation record
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Write clinical summary
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Save the diagnosis, treatment plan, and follow-up timing after the
            paid consultation is complete.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          href="/vet/consultations"
        >
          Back to consultations
        </Link>
      </div>

      <ConsultationRecordForm
        canWrite={consultation.paymentStatus === "completed"}
        consultationId={consultation._id.toString()}
        consultationType={consultation.type}
        initialDiagnosis={consultation.diagnosis}
        initialFollowUpDueDate={
          consultation.followUpDueDate
            ? consultation.followUpDueDate.toISOString().slice(0, 10)
            : ""
        }
        initialNotes={consultation.notes}
        initialTreatmentPlan={consultation.treatmentPlan}
        pet={pet}
        scheduledAt={consultation.scheduledAt.toISOString()}
        user={user}
      />
      {isPopulatedPet(consultation.petId) && consultation.petId._id ? (
        <RecordAttachmentUploader
          consultationId={consultation._id.toString()}
          petId={consultation.petId._id.toString()}
        />
      ) : null}
    </section>
  );
}
