import type { Metadata } from "next";
import { notFound } from "next/navigation";
import mongoose from "mongoose";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Pet } from "@/lib/db/models/Pet";
import { Prescription } from "@/lib/db/models/Prescription";
import "@/lib/db/models/User";

type PetPrescriptionsPageProps = {
  params: Promise<{ petId: string }>;
};

type PetSummary = {
  _id: { toString(): string };
  name: string;
  userId: { toString(): string };
};

type PetPrescription = {
  _id: { toString(): string };
  expiryDate: Date;
  followUpInstructions?: string;
  issuedDate: Date;
  medications: {
    dosage: string;
    duration: string;
    frequency: string;
    instructions?: string;
    name: string;
  }[];
};

export const metadata: Metadata = {
  title: "Prescriptions | pawwcure",
};

export default async function PetPrescriptionsPage({
  params,
}: PetPrescriptionsPageProps) {
  const { petId } = await params;

  if (!mongoose.Types.ObjectId.isValid(petId)) {
    notFound();
  }

  const session = await getSession();
  await dbConnect();

  const petQuery: Record<string, unknown> = { _id: petId };
  if (session?.userId) {
    petQuery.userId = session.userId;
  }

  const pet = (await Pet.findOne(petQuery).lean()) as unknown as
    | PetSummary
    | null;

  if (!pet) {
    notFound();
  }

  const prescriptions = (await Prescription.find({ petId: pet._id })
    .sort({ issuedDate: -1 })
    .limit(30)
    .lean()) as unknown as PetPrescription[];

  return (
    <UserPageScaffold
      actionHref="/reminders"
      actionLabel="Create Reminder"
      description={`Medication, dosage, duration, and follow-up instructions for ${pet.name}.`}
      eyebrow="Prescriptions"
      title={`${pet.name} prescriptions`}
    >
      {prescriptions.length > 0 ? (
        <div className="space-y-5">
          {prescriptions.map((prescription) => (
            <div
              className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm"
              key={prescription._id.toString()}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    Issued{" "}
                    {new Date(prescription.issuedDate).toLocaleDateString()}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    {prescription.medications.length} medication
                    {prescription.medications.length === 1 ? "" : "s"}
                  </h2>
                </div>
                <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  Valid until{" "}
                  {new Date(prescription.expiryDate).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {prescription.medications.map((medication) => (
                  <div
                    className="rounded-2xl bg-slate-50 p-4"
                    key={`${prescription._id}-${medication.name}`}
                  >
                    <p className="font-bold text-slate-950">
                      {medication.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {medication.dosage} / {medication.frequency} /{" "}
                      {medication.duration}
                    </p>
                    {medication.instructions ? (
                      <p className="mt-2 text-sm text-slate-600">
                        {medication.instructions}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>

              {prescription.followUpInstructions ? (
                <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                  {prescription.followUpInstructions}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[2.5rem] border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            No prescriptions yet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Prescriptions created by vets after consultations will appear here.
          </p>
        </div>
      )}
    </UserPageScaffold>
  );
}
