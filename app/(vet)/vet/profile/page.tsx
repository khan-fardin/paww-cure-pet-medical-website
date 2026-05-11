import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";

export const metadata: Metadata = {
  title: "My Profile | pawwcure",
};

type VetProfileView = {
  _id: { toString(): string };
  applicationStatus: "draft" | "submitted" | "approved" | "rejected";
  availability?: { day: string; startTime: string; endTime: string }[];
  bio?: string;
  clinicAddress: string;
  clinicCity: string;
  clinicName: string;
  consultationDuration: number;
  consultationFee: number;
  degreeDocumentName?: string;
  experience: number;
  isVerified: boolean;
  languages: string[];
  licenseDocumentName?: string;
  licenseNumber: string;
  phoneNumber: string;
  rejectionReason?: string;
  specializations: string[];
  userId?: {
    avatar?: string;
    email?: string;
    name?: string;
  };
};

function statusStyle(status: VetProfileView["applicationStatus"]) {
  if (status === "approved") return "border-emerald-100 bg-emerald-50 text-emerald-800";
  if (status === "rejected") return "border-red-100 bg-red-50 text-red-800";
  return "border-amber-100 bg-amber-50 text-amber-800";
}

export default async function ProfilePage() {
  const session = await getSession();

  await dbConnect();

  const profile = session
    ? ((await VetProfile.findOne({ userId: session.userId })
        .populate("userId", "name email avatar")
        .lean()) as unknown as VetProfileView | null)
    : null;

  if (!profile) {
    return (
      <section className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="mt-2 text-slate-500">
            Your vet profile appears after you submit an application.
          </p>
        </div>

        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">No vet application found</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-slate-500">
            Apply as a vet to create your professional record. Once a moderator
            approves it, this profile becomes the profile users can book.
          </p>
          <Link
            className="mt-6 inline-flex rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
            href="/apply-as-vet"
          >
            Start application
          </Link>
        </div>
      </section>
    );
  }

  const name = profile.userId?.name ?? "Vet profile";
  const avatar =
    profile.userId?.avatar ?? `https://i.pravatar.cc/240?u=${profile._id}`;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="mt-2 text-slate-500">
          This is the profile connected to your application and public vet page.
        </p>
      </div>

      <div
        className={`rounded-[2rem] border px-5 py-4 text-sm font-bold ${statusStyle(
          profile.applicationStatus
        )}`}
      >
        Application status: {profile.applicationStatus}
        {profile.rejectionReason ? ` - ${profile.rejectionReason}` : ""}
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
          <Image
            alt={name}
            className="h-48 w-full rounded-[2rem] object-cover"
            height={240}
            src={avatar}
            width={320}
          />
          <h2 className="mt-5 text-2xl font-bold">{name}</h2>
          <p className="mt-1 text-sm text-slate-500">{profile.userId?.email}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.specializations.map((specialty) => (
              <span
                className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700"
                key={specialty}
              >
                {specialty}
              </span>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <Card title="Professional Details">
            <Info label="Bio" value={profile.bio || "No bio provided"} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Experience" value={`${profile.experience} years`} />
              <Info label="Fee" value={`BDT ${profile.consultationFee}`} />
              <Info
                label="Session duration"
                value={`${profile.consultationDuration} minutes`}
              />
              <Info
                label="Languages"
                value={profile.languages.length ? profile.languages.join(", ") : "English"}
              />
            </div>
          </Card>

          <Card title="Clinic & Credentials">
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Clinic" value={profile.clinicName} />
              <Info label="Phone" value={profile.phoneNumber} />
              <Info
                label="Location"
                value={`${profile.clinicAddress}, ${profile.clinicCity}`}
              />
              <Info label="License" value={profile.licenseNumber} />
              <Info
                label="License document"
                value={profile.licenseDocumentName ?? "Not uploaded"}
              />
              <Info
                label="Degree document"
                value={profile.degreeDocumentName ?? "Not uploaded"}
              />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Card({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
      <h2 className="mb-5 text-2xl font-bold">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 leading-relaxed text-slate-700">{value}</p>
    </div>
  );
}
