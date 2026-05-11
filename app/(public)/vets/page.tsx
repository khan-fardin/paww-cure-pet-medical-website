"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader, AlertCircle } from "lucide-react";

import { useVets } from "@/lib/hooks/useVets";

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

export default function VetsPage() {
  const [city, setCity] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [page, setPage] = useState(1);

  const { vets, loading, error, pagination, refetch } = useVets({
    city: city || undefined,
    specialization: specialization || undefined,
    minRating: minRating > 0 ? minRating : undefined,
    page,
    limit: 12,
  });

  const specialties = [
    "All",
    "General",
    "Surgery",
    "Dentistry",
    "Dermatology",
    "Cardiology",
  ];

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
            Browse verified specialists, compare fees and availability, then book
            a consultation with ease.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-3 flex-wrap">
            {specialties.map((specialty) => (
              <button
                onClick={() => {
                  setSpecialization(specialty === "All" ? "" : specialty);
                  setPage(1);
                }}
                className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                  (specialty === "All" && !specialization) ||
                  specialization === specialty
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
                key={specialty}
                type="button"
              >
                {specialty}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by city..."
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <select
              value={minRating}
              onChange={(e) => {
                setMinRating(Number(e.target.value));
                setPage(1);
              }}
              className="px-4 py-2 rounded-2xl border border-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value={0}>All Ratings</option>
              <option value={4}>4+ Stars</option>
              <option value={4.5}>4.5+ Stars</option>
              <option value={5}>5 Stars</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex items-center gap-3 mb-6">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <p className="font-bold text-red-900">Failed to load vets</p>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={refetch}
                className="mt-2 text-sm font-bold text-red-600 hover:text-red-700 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col rounded-[2.5rem] bg-white shadow-sm ring-1 ring-slate-100 animate-pulse"
              >
                <div className="h-64 bg-slate-200" />
                <div className="flex-1 flex-col p-7 space-y-3">
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="mt-6 h-10 bg-slate-200 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : vets.length === 0 ? (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-300 p-12 text-center">
            <h3 className="text-xl font-bold text-slate-700">No vets found</h3>
            <p className="mt-2 text-slate-500">
              Try adjusting your search filters
            </p>
            <button
              onClick={() => {
                setCity("");
                setSpecialization("");
                setMinRating(0);
                setPage(1);
              }}
              className="mt-6 inline-flex rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {vets.map((vet) => (
                <Link
                  className="group flex min-h-[520px] flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-[400ms] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]"
                  href={`/vets/${vet._id}`}
                  key={vet._id}
                >
                  <div className="relative h-64 bg-emerald-50">
                    {vet.userId?.avatar ? (
                      <Image
                        alt={vet.userId?.name}
                        className="object-cover"
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                        src={vet.userId?.avatar}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200" />
                    )}
                    {vet.isVerified && (
                      <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 backdrop-blur-xl">
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-7">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">
                          {vet.userId?.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                          {vet.clinicCity}, {vet.clinicProvince}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-bold text-yellow-600">
                        <StarIcon />
                        {vet.averageRating.toFixed(1)}
                      </div>
                    </div>

                    <div className="mb-5 flex flex-wrap gap-2">
                      {vet.specializations.slice(0, 2).map((spec) => (
                        <span
                          className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700"
                          key={spec}
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-slate-500">
                      {vet.bio || `${vet.experience} years of experience`}
                    </p>

                    <div className="mt-auto border-t border-slate-100 pt-5">
                      <div className="mb-4 flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-400">Fee</span>
                        <span className="font-bold text-[#1A1A1A]">
                          BDT {vet.consultationFee}
                        </span>
                      </div>
                      <span className="inline-flex w-full justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition group-hover:bg-emerald-700">
                        View Profile
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                        p === page
                          ? "bg-emerald-600 text-white"
                          : "border border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setPage(Math.min(pagination.pages, page + 1))
                  }
                  disabled={page === pagination.pages}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
