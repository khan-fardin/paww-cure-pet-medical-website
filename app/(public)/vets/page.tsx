import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import { demoVets } from "@/lib/demo/publicContent";

export const metadata: Metadata = {
  title: "Find Vets | pawwcure",
  description: "Browse demo pawwcure vet profiles and available consultation slots.",
};

function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 fill-current"
      viewBox="0 0 20 20"
    >
      <path d="m10 1.5 2.49 5.04 5.56.81-4.03 3.93.95 5.54L10 14.2l-4.97 2.62.95-5.54-4.03-3.93 5.56-.81L10 1.5Z" />
    </svg>
  );
}

export default async function VetsPage() {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(cookieStore.get("access_token")?.value);

  return (
    <section className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Verified vet directory
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Find the right vet for your pet.
            </h1>
          </div>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-500 lg:justify-self-end">
            Browse demo specialists, compare fees and availability, then open a
            profile after login to continue toward booking.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {["All", "Video", "Emergency", "Nutrition", "Dermatology"].map(
            (filter) => (
              <button
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                key={filter}
                type="button"
              >
                {filter}
              </button>
            ),
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {demoVets.map((vet) => {
            const profileHref = `/vets/${vet.id}`;
            // const href = isLoggedIn
            //   ? profileHref
            //   : `/login?returnUrl=${encodeURIComponent(profileHref)}`;
            const href = profileHref;

            return (
              <Link
                className="group flex min-h-[520px] flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-[400ms] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]"
                href={href}
                key={vet.id}
              >
                <div className="relative h-64 bg-emerald-50">
                  <Image
                    alt={vet.name}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    src={vet.avatar}
                  />
                  <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 backdrop-blur-xl">
                    Next: {vet.nextSlot}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">
                        {vet.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-400">
                        {vet.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-bold text-yellow-600">
                      <StarIcon />
                      {vet.rating}
                    </div>
                  </div>

                  <div className="mb-5 flex flex-wrap gap-2">
                    {vet.specialties.slice(0, 2).map((specialty) => (
                      <span
                        className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700"
                        key={specialty}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-slate-500">
                    {vet.bio}
                  </p>

                  <div className="mt-auto border-t border-slate-100 pt-5">
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-400">Fee</span>
                      <span className="font-bold text-[#1A1A1A]">
                        {vet.consultFee}
                      </span>
                    </div>
                    <span className="inline-flex w-full justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition group-hover:bg-emerald-700">
                      {isLoggedIn ? "View Profile" : "Log in to View"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
