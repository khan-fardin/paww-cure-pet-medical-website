import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Clock, Mail, Phone, Video } from "lucide-react";

import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { VetProfile } from "@/lib/db/models/VetProfile";
import "@/lib/db/models/Pet";
import "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "Consultation Operations | pawwcure Moderator",
};

type ModConsultation = {
  _id: { toString(): string };
  agoraChannelName?: string;
  paymentStatus: string;
  petId?: { name?: string; species?: string };
  scheduledAt: Date;
  startedAt?: Date;
  status: "scheduled" | "ongoing" | "completed" | "cancelled" | "no-show";
  type: string;
  userId?: { email?: string; name?: string; phone?: string };
  vetId?: {
    _id?: { toString(): string };
    email?: string;
    name?: string;
    phone?: string;
  };
};

type VetContact = {
  phoneNumber?: string;
  userId: { toString(): string };
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

function statusClass(status: ModConsultation["status"]) {
  if (status === "ongoing") return "bg-blue-50 text-blue-700";
  if (status === "scheduled") return "bg-amber-50 text-amber-700";
  if (status === "completed") return "bg-emerald-50 text-emerald-700";
  return "bg-red-50 text-red-700";
}

function needsAttention(consultation: ModConsultation) {
  const scheduledAt = new Date(consultation.scheduledAt).getTime();
  const now = Date.now();
  const minutesLate = (now - scheduledAt) / 60000;

  return (
    consultation.paymentStatus === "completed" &&
    consultation.status === "scheduled" &&
    minutesLate > 5
  );
}

export default async function ModConsultationsPage() {
  await dbConnect();

  const now = new Date();
  const pastWindow = new Date(now);
  pastWindow.setHours(now.getHours() - 6);
  const futureWindow = new Date(now);
  futureWindow.setDate(now.getDate() + 7);

  const consultations = (await Consultation.find({
    scheduledAt: { $gte: pastWindow, $lte: futureWindow },
    status: {
      $in: ["scheduled", "ongoing", "completed", "cancelled", "no-show"],
    },
  })
    .populate("petId", "name species")
    .populate("userId", "name email phone")
    .populate("vetId", "name email phone")
    .sort({ scheduledAt: 1 })
    .limit(100)
    .lean()) as unknown as ModConsultation[];

  const vetUserIds = consultations
    .map((consultation) => consultation.vetId?._id?.toString())
    .filter((id): id is string => Boolean(id));

  const vetProfiles = (await VetProfile.find({ userId: { $in: vetUserIds } })
    .select("phoneNumber userId")
    .lean()) as unknown as VetContact[];

  const vetContactByUserId = new Map(
    vetProfiles.map((profile) => [profile.userId.toString(), profile])
  );

  const active = consultations.filter((item) =>
    ["scheduled", "ongoing"].includes(item.status)
  );
  const attention = active.filter(needsAttention);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Live operations
          </div>
          <h1 className="text-3xl font-bold">Consultation Monitor</h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Watch booked consultations, identify delayed vet joins, and contact
            users or doctors when a session needs help.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Active" value={active.length} />
          <Metric label="Needs help" value={attention.length} />
          <Metric label="Total shown" value={consultations.length} />
        </div>
      </div>

      {attention.length > 0 ? (
        <Card className="border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <h2 className="font-bold text-amber-950">
                {attention.length} scheduled consultation needs attention
              </h2>
              <p className="mt-1 text-sm text-amber-800">
                These are paid sessions still marked scheduled more than five
                minutes after their start time.
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="space-y-4">
        {consultations.length === 0 ? (
          <Card>
            <p className="font-bold text-slate-700">
              No consultations in the operations window.
            </p>
          </Card>
        ) : (
          consultations.map((consultation) => {
            const id = consultation._id.toString();
            const flagged = needsAttention(consultation);
            const vetUserId = consultation.vetId?._id?.toString();
            const vetProfile = vetUserId
              ? vetContactByUserId.get(vetUserId)
              : undefined;
            const vetPhone =
              consultation.vetId?.phone ?? vetProfile?.phoneNumber;

            return (
              <Card
                className={flagged ? "border-amber-200 bg-amber-50/60" : ""}
                key={id}
              >
                <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(
                          consultation.status
                        )}`}
                      >
                        {consultation.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {consultation.paymentStatus}
                      </span>
                      {consultation.agoraChannelName ? (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                          room ready
                        </span>
                      ) : null}
                    </div>

                    <h2 className="text-xl font-bold text-slate-950">
                      {consultation.petId?.name ?? "Pet"} with{" "}
                      {consultation.vetId?.name ?? "Vet"}
                    </h2>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <ContactCard
                        email={consultation.userId?.email}
                        label="User contact"
                        name={consultation.userId?.name ?? "User"}
                        phone={consultation.userId?.phone}
                      />
                      <ContactCard
                        email={consultation.vetId?.email}
                        label="Doctor contact"
                        name={consultation.vetId?.name ?? "Vet"}
                        phone={vetPhone}
                      />
                    </div>

                    <p className="mt-3 text-sm font-bold uppercase tracking-wider text-slate-400">
                      Type: {consultation.type}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {new Date(consultation.scheduledAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-4 py-3 text-sm font-bold text-white"
                      href={`/consultation/${id}/summary`}
                    >
                      View Summary
                    </Link>
                    <Link
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600"
                      href={`/consultation/${id}`}
                    >
                      <Video className="h-4 w-4" />
                      Open Room
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </section>
  );
}

function ContactCard({
  email,
  label,
  name,
  phone,
}: {
  email?: string;
  label: string;
  name: string;
  phone?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-bold text-slate-950">{name}</p>
      <div className="mt-3 space-y-2 text-sm text-slate-600">
        <p className="flex min-w-0 items-center gap-2">
          <Mail className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">{email ?? "No email"}</span>
        </p>
        {phone ? (
          <a
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-3 py-2 font-bold text-emerald-700 shadow-sm ring-1 ring-slate-100"
            href={`tel:${phone}`}
          >
            <Phone className="h-4 w-4" />
            {phone}
          </a>
        ) : (
          <p className="flex items-center gap-2 text-slate-400">
            <Phone className="h-4 w-4" />
            No phone
          </p>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
