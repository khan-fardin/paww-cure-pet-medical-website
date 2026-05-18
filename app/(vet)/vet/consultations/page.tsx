import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";

import { User } from "@/lib/db/models/User";
import { Consultation } from "@/lib/db/models/Consultation";
import { Pet } from "@/lib/db/models/Pet";

export const metadata: Metadata = {
  title: "My Consultations | pawwcure",
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

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function VetConsultationsPage() {
  const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");

  // Get current vet from token
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let vetUserId = null;
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    if (verified.payload.role !== "vet") {
      redirect("/unauthorized");
    }
    vetUserId = verified.payload.userId as string;
  } catch {
    redirect("/login");
  }

  // Fetch all consultations for this vet
  const consultations = await Consultation.find({
    vetId: vetUserId,
  })
    .populate("petId", "name species breed")
    .populate("userId", "name email")
    .sort({ scheduledAt: -1 })
    .lean();

  const upcomingConsultations = consultations.filter(
    (c) => c.status === "scheduled" || c.status === "ongoing"
  );
  const completedConsultations = consultations.filter(
    (c) => c.status === "completed"
  );

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Consultations</h1>
        <p className="mt-2 text-slate-500">
          Manage your consultations and patient records
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Upcoming Sessions</h2>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700">
              {upcomingConsultations.length} sessions
            </span>
          </div>

          <div className="space-y-4">
            {upcomingConsultations.length > 0 ? (
              upcomingConsultations.map((consultation) => (
                <div
                  className="flex items-start justify-between gap-4 rounded-[2rem] border border-slate-100 p-5"
                  key={consultation._id?.toString()}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                      <p className="text-sm font-bold text-slate-500">
                        {formatDate(consultation.scheduledAt)}
                      </p>
                    </div>
                    <h3 className="mt-2 text-lg font-bold">
                      {(consultation.petId as any)?.name || "Unknown Pet"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {consultation.type} consultation
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Patient: {(consultation.userId as any)?.name || "Unknown"}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      className="rounded-2xl bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700"
                      href={`/vet/consultations/${consultation._id?.toString()}`}
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No upcoming sessions</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Completed Sessions</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              {completedConsultations.length} completed
            </span>
          </div>

          <div className="space-y-4">
            {completedConsultations.length > 0 ? (
              completedConsultations.map((consultation) => (
                <div
                  className="flex items-start justify-between gap-4 rounded-[2rem] border border-slate-100 p-5"
                  key={consultation._id?.toString()}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <p className="text-sm font-bold text-slate-500">
                        {formatDate(consultation.completedAt || consultation.scheduledAt)}
                      </p>
                    </div>
                    <h3 className="mt-2 text-lg font-bold">
                      {(consultation.petId as any)?.name || "Unknown Pet"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {consultation.type} consultation
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Patient: {(consultation.userId as any)?.name || "Unknown"}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                      href={`/vet/consultations/${consultation._id?.toString()}/record`}
                    >
                      View Record
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No completed sessions</p>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
