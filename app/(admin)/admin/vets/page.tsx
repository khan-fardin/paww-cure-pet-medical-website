import type { Metadata } from "next";
import { CheckCircle2, Clock, Stethoscope, XCircle } from "lucide-react";

import {
  VetReviewQueue,
  type VetApplicationItem,
} from "@/components/mod/VetReviewQueue";
import { dbConnect } from "@/lib/db/connect";
import "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";

export const metadata: Metadata = {
  title: "Vet Management | pawwcure Admin",
};

type AdminVet = {
  _id: { toString(): string };
  avatar?: string;
  bio?: string;
  clinicCity: string;
  clinicName?: string;
  consultationFee: number;
  createdAt: Date;
  degreeDocumentName?: string;
  experience: number;
  isActive: boolean;
  isVerified: boolean;
  licenseDocumentName?: string;
  licenseNumber: string;
  phoneNumber?: string;
  rejectionReason?: string;
  specializations: string[];
  applicationStatus: VetApplicationItem["status"];
  userId?: {
    avatar?: string;
    email?: string;
    name?: string;
    phone?: string;
  };
};

function toVetItem(vet: AdminVet): VetApplicationItem {
  return {
    id: vet._id.toString(),
    avatar: vet.userId?.avatar ?? vet.avatar,
    bio: vet.bio,
    clinicCity: vet.clinicCity,
    clinicName: vet.clinicName,
    consultationFee: vet.consultationFee,
    createdAt: vet.createdAt.toISOString(),
    degreeDocumentName: vet.degreeDocumentName,
    email: vet.userId?.email ?? "No email",
    experience: vet.experience,
    isVerified: vet.isVerified,
    licenseDocumentName: vet.licenseDocumentName,
    licenseNumber: vet.licenseNumber,
    name: vet.userId?.name ?? "Unnamed vet",
    phone: vet.userId?.phone ?? vet.phoneNumber,
    rejectionReason: vet.rejectionReason,
    specializations: vet.specializations,
    status: vet.applicationStatus,
  };
}

export default async function AdminVetsPage() {
  await dbConnect();

  const vets = (await VetProfile.find({})
    .populate("userId", "name email phone avatar")
    .sort({ createdAt: -1 })
    .lean()) as unknown as AdminVet[];

  const total = vets.length;
  const verified = vets.filter((vet) => vet.isVerified).length;
  const pending = vets.filter((vet) => vet.applicationStatus === "submitted").length;
  const rejected = vets.filter((vet) => vet.applicationStatus === "rejected").length;

  return (
    <section className="space-y-8">
      <div>
        <div className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
          Vet Management
        </div>
        <h1 className="text-4xl font-bold">Veterinarian Accounts</h1>
        <p className="mt-2 text-slate-500">
          Manage verification, public profile status, and application outcomes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Stethoscope} label="Total vets" value={total} tone="emerald" />
        <Stat icon={CheckCircle2} label="Verified" value={verified} tone="blue" />
        <Stat icon={Clock} label="Pending" value={pending} tone="amber" />
        <Stat icon={XCircle} label="Rejected" value={rejected} tone="red" />
      </div>

      <VetReviewQueue vets={vets.map(toVetItem)} />
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: typeof Stethoscope;
  label: string;
  tone: "amber" | "blue" | "emerald" | "red";
  value: number;
}) {
  const tones = {
    amber: "border-amber-100 bg-amber-50 text-amber-900",
    blue: "border-blue-100 bg-blue-50 text-blue-900",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-900",
    red: "border-red-100 bg-red-50 text-red-900",
  };

  return (
    <div className={`rounded-[2rem] border p-5 ${tones[tone]}`}>
      <div className="mb-4 inline-flex rounded-2xl bg-white/70 p-3">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
