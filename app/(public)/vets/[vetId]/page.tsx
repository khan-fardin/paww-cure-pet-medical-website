import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getDemoVet } from "@/lib/demo/publicContent";

type VetProfilePageProps = {
  params: Promise<{ vetId: string }>;
};

export async function generateMetadata({
  params,
}: VetProfilePageProps): Promise<Metadata> {
  const { vetId } = await params;
  const vet = getDemoVet(vetId);

  return {
    title: vet ? `${vet.name} | pawwcure` : "Vet profile | pawwcure",
  };
}

export default async function VetProfilePage({ params }: VetProfilePageProps) {
  const { vetId } = await params;
  const cookieStore = await cookies();

  if (!cookieStore.get("access_token")?.value) {
    redirect(`/login?returnUrl=${encodeURIComponent(`/vets/${vetId}`)}`);
  }

  const vet = getDemoVet(vetId);

  if (!vet) {
    notFound();
  }

  return (
    <section className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-6xl">
        <Link
          className="mb-8 inline-flex text-sm font-bold text-emerald-600 hover:text-emerald-700"
          href="/vets"
        >
          Back to vets
        </Link>

        <div className="grid overflow-hidden rounded-[3rem] bg-white shadow-sm ring-1 ring-slate-100 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[520px] bg-emerald-50">
            <Image
              alt={vet.name}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              src={vet.avatar}
            />
            <div className="absolute bottom-8 left-8 right-8 rounded-[2rem] bg-white/85 p-6 shadow-sm backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Next available
              </p>
              <p className="mt-1 text-2xl font-bold">{vet.nextSlot}</p>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            <div className="mb-5 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Verified pawwcure vet
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
              {vet.name}
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-slate-500">
              {vet.bio}
            </p>

            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Rating", `${vet.rating} (${vet.ratingCount})`],
                ["Experience", `${vet.yearsExperience} years`],
                ["Fee", vet.consultFee],
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
                  {vet.specialties.map((specialty) => (
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
                    Education
                  </h2>
                  <p className="leading-relaxed text-slate-600">
                    {vet.education}
                  </p>
                </div>
                <div>
                  <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">
                    Languages
                  </h2>
                  <p className="leading-relaxed text-slate-600">
                    {vet.languages.join(", ")}
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] bg-emerald-950 p-6 text-white">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">
                  Availability
                </p>
                <p className="mt-2 text-xl font-bold">{vet.availability}</p>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex flex-1 justify-center rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-600/25 transition hover:scale-[1.02] active:scale-95"
                href={`/book/${vet.id}`}
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
