import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";

import { dbConnect } from "@/lib/db/connect";
import "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";

type VetProfilePageProps = {
  params: Promise<{ vetId: string }>;
};

type PublicVetProfile = {
  _id: { toString(): string };
  availability?: { day: string; startTime: string; endTime: string }[];
  averageRating: number;
  bio?: string;
  clinicCity: string;
  clinicName: string;
  consultationDuration: number;
  consultationFee: number;
  experience: number;
  languages: string[];
  servicesOffered: string[];
  specializations: string[];
  totalReviews: number;
  userId?: {
    avatar?: string;
    name?: string;
  };
};

async function getVetProfile(vetId: string) {
  if (!mongoose.Types.ObjectId.isValid(vetId)) return null;

  await dbConnect();

  return (await VetProfile.findOne({
    _id: vetId,
    acceptingNewPatients: true,
    isActive: true,
    isVerified: true,
  })
    .populate("userId", "name avatar")
    .lean()) as unknown as PublicVetProfile | null;
}

export async function generateMetadata({
  params,
}: VetProfilePageProps): Promise<Metadata> {
  const { vetId } = await params;
  const vet = await getVetProfile(vetId);

  return {
    title: vet?.userId?.name ? `${vet.userId.name} | pawwcure` : "Vet profile | pawwcure",
  };
}

export default async function VetProfilePage({ params }: VetProfilePageProps) {
  const { vetId } = await params;
  const vet = await getVetProfile(vetId);

  if (!vet) {
    notFound();
  }

  const name = vet.userId?.name ?? "pawwcure vet";
  const avatar = vet.userId?.avatar ?? `https://i.pravatar.cc/420?u=${vet._id}`;
  const firstSlot = vet.availability?.[0];
  const availability = firstSlot
    ? `${firstSlot.day}, ${firstSlot.startTime}-${firstSlot.endTime}`
    : "Availability shared after booking request";

  return (
    <section className="px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <Link
          className="mb-8 inline-flex text-sm font-bold text-emerald-600 hover:text-emerald-700"
          href="/vets"
        >
          Back to vets
        </Link>

        <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-100 sm:rounded-[3rem] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[360px] bg-emerald-50 sm:min-h-[520px]">
            <Image
              alt={name}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              src={avatar}
            />
            <div className="absolute bottom-5 left-5 right-5 rounded-[2rem] bg-white/85 p-5 shadow-sm backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-8 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Next available
              </p>
              <p className="mt-1 text-xl font-bold sm:text-2xl">
                {availability}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-12">
            <div className="mb-5 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Verified pawwcure vet
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
              {name}
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-slate-500">
              {vet.bio ||
                `${name} offers remote pet care through pawwcure with a verified clinical profile.`}
            </p>

            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Rating", `${vet.averageRating || 0} (${vet.totalReviews})`],
                ["Experience", `${vet.experience} years`],
                ["Fee", `BDT ${vet.consultationFee}`],
              ].map(([label, value]) => (
                <div
                  className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5"
                  key={label}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {label}
                  </p>
                  <p className="mt-2 text-lg font-bold">{value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
                  Specialties
                </h2>
                <div className="flex flex-wrap gap-2">
                  {vet.specializations.map((specialty) => (
                    <span
                      className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700"
                      key={specialty}
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">
                    Clinic
                  </h2>
                  <p className="leading-relaxed text-slate-600">
                    {vet.clinicName}, {vet.clinicCity}
                  </p>
                </div>
                <div>
                  <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">
                    Languages
                  </h2>
                  <p className="leading-relaxed text-slate-600">
                    {vet.languages.length ? vet.languages.join(", ") : "English"}
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] bg-emerald-950 p-6 text-white">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">
                  Consultation
                </p>
                <p className="mt-2 text-xl font-bold">
                  {vet.consultationDuration} minute session
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex flex-1 justify-center rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-600/25 transition hover:scale-[1.02] active:scale-95"
                href={`/book/${vet._id}`}
              >
                Book Consultation
              </Link>
              <Link
                className="inline-flex flex-1 justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition hover:bg-emerald-50"
                href="/vets"
              >
                Compare Vets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
