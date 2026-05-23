import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { StartVetCallButton } from "@/components/vet/StartVetCallButton";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import "@/lib/db/models/Pet";
import "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "Consultation Details | pawwcure",
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

function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700";
    case "scheduled":
      return "bg-blue-50 text-blue-700";
    case "ongoing":
      return "bg-yellow-50 text-yellow-700";
    case "cancelled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-50 text-slate-700";
  }
}

function formatDate(date: Date | undefined): string {
  if (!date) return "Not set";
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculateAge(dateOfBirth: Date): string {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return `${age} year${age !== 1 ? "s" : ""}`;
}

type ConsultationDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConsultationDetailsPage({
  params,
}: ConsultationDetailsPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/login?returnUrl=/vet/consultations/${id}`);
  }

  if (session.role !== "vet") {
    redirect("/dashboard");
  }

  await dbConnect();

  const consultation = await Consultation.findById(id)
    .populate("petId")
    .populate("userId", "name email")
    .lean();

  if (!consultation || consultation.vetId?.toString() !== session.userId) {
    notFound();
  }

  const pet = consultation.petId as any;
  const user = consultation.userId as any;
  const age = pet?.dateOfBirth ? calculateAge(new Date(pet.dateOfBirth)) : "Unknown";

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Consultation Details</h1>
          <p className="mt-2 text-slate-500">ID: {id}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {consultation.status !== "completed" ? (
            <StartVetCallButton
              consultationId={id}
              disabled={consultation.paymentStatus !== "completed"}
            />
          ) : null}
          <Link
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-6 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
            href="/vet/consultations"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-2xl font-bold mb-4">Consultation Info</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Date & Time
                </p>
                <p className="mt-2 text-lg font-bold">{formatDate(consultation.scheduledAt)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Type
                </p>
                <p className="mt-2 text-lg font-bold capitalize">{consultation.type} Consultation</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status
                </p>
                <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-bold ${getStatusColor(consultation.status)}`}>
                  {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Fee (BDT)
                </p>
                <p className="mt-2 text-lg font-bold">{consultation.fees.total}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold mb-4">Patient Record</h2>
            <div className="space-y-4">
              {consultation.diagnosis && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Diagnosis
                  </p>
                  <p className="mt-2 text-slate-700">{consultation.diagnosis}</p>
                </div>
              )}
              {consultation.notes && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Notes
                  </p>
                  <p className="mt-2 text-slate-700">{consultation.notes}</p>
                </div>
              )}
              {consultation.treatmentPlan && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Treatment Plan
                  </p>
                  <p className="mt-2 text-slate-700">{consultation.treatmentPlan}</p>
                </div>
              )}
              {consultation.followUpDueDate && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Follow-up Date
                  </p>
                  <p className="mt-2 font-bold">{formatDate(consultation.followUpDueDate)}</p>
                </div>
              )}
              {!consultation.diagnosis && !consultation.notes && (
                <p className="text-slate-500">No patient record yet</p>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <h2 className="text-lg font-bold mb-4">Pet Info</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-bold text-slate-900">Pet Name</p>
                <p className="mt-1 text-slate-600">{pet?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">Species</p>
                <p className="mt-1 text-slate-600 capitalize">{pet?.species || "Unknown"}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">Breed</p>
                <p className="mt-1 text-slate-600">{pet?.breed || "Unknown"}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">Age</p>
                <p className="mt-1 text-slate-600">{age}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">Weight</p>
                <p className="mt-1 text-slate-600">{pet?.weight || "Unknown"} kg</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="font-bold text-slate-900">User</p>
                <p className="mt-1 text-slate-600">{user?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">Email</p>
                <p className="mt-1 text-slate-600 text-xs break-all">{user?.email || "Unknown"}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
