import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Stethoscope } from "lucide-react";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import "@/lib/db/models/Pet";
import "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "My Patients | pawwcure",
};

type PatientConsultation = {
  _id: { toString(): string };
  petId?: {
    _id: { toString(): string };
    avatar?: string;
    breed?: string;
    name?: string;
    species?: string;
  };
  scheduledAt: Date;
  status: string;
  userId?: {
    name?: string;
  };
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

export default async function PatientsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?returnUrl=/vet/patients");
  }

  if (session.role !== "vet") {
    redirect("/dashboard");
  }

  await dbConnect();

  const consultations = await Consultation.find({ vetId: session.userId })
    .populate("petId", "name species breed avatar")
    .populate("userId", "name")
    .sort({ scheduledAt: -1 })
    .lean<PatientConsultation[]>();

  const patients = new Map<string, PatientConsultation>();
  consultations.forEach((consultation) => {
    const petId = consultation.petId?._id?.toString();
    if (petId && !patients.has(petId)) {
      patients.set(petId, consultation);
    }
  });

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Patients</h1>
        <p className="mt-2 text-slate-500">
          Pets connected to consultations assigned to your vet account.
        </p>
      </div>

      {patients.size === 0 ? (
        <Card>
          <p className="font-bold text-slate-700">No patients yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Patients will appear here after users book consultations with you.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from(patients.values()).map((consultation) => {
            const pet = consultation.petId;
            const petId = pet?._id?.toString() ?? consultation._id.toString();

            return (
              <Card key={petId}>
                <div className="mb-4">
                  <div className="mb-4 flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                    {pet?.avatar ? (
                      <img
                        alt={pet.name ?? "Patient"}
                        className="h-full w-full object-cover"
                        src={pet.avatar}
                      />
                    ) : (
                      <Stethoscope className="h-12 w-12 text-slate-300" />
                    )}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Patient
                  </p>
                  <h3 className="mt-1 text-2xl font-bold">
                    {pet?.name ?? "Patient"}
                  </h3>
                  <p className="mt-1 text-sm capitalize text-slate-500">
                    {pet?.species ?? "pet"} / {pet?.breed ?? "Mixed breed"}
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">
                      Last visit: {new Date(consultation.scheduledAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">
                      User: {consultation.userId?.name ?? "User"}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    className="block rounded-2xl bg-teal-600 px-4 py-2 text-center text-sm font-bold text-white"
                    href={`/vet/consultations/${consultation._id.toString()}`}
                  >
                    View Latest Consult
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
