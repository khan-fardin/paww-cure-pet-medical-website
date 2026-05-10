"use client";

import Image from "next/image";
import Link from "next/link";
import { PawPrint, Loader, AlertCircle } from "lucide-react";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { usePets } from "@/lib/hooks/usePets";

export default function PetsPage() {
  const { pets, loading, error, refetch } = usePets();

  return (
    <UserPageScaffold
      actionHref="/pets/new"
      actionLabel="Add Pet"
      description="Manage pet profiles, conditions, records, prescriptions, and reminders from one place."
      eyebrow="Pet profiles"
      title="Pets"
    >
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex items-center gap-3 mb-6">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <p className="font-bold text-red-900">Failed to load pets</p>
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

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm animate-pulse"
            >
              <div className="h-64 bg-slate-200" />
              <div className="p-7 space-y-4">
                <div className="h-8 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : pets.length === 0 ? (
        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-300 p-12 text-center">
          <PawPrint className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No pets yet</h3>
          <p className="mt-2 text-slate-500">
            Add your first pet to get started with pawwcure
          </p>
          <Link
            href="/pets/new"
            className="mt-6 inline-flex rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition"
          >
            Add Your First Pet
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {pets.map((pet) => (
            <Link
              className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]"
              href={`/pets/${pet._id}`}
              key={pet._id}
            >
              <div className="relative h-64">
                {pet.avatar ? (
                  <Image
                    alt={pet.name}
                    className="object-cover"
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    src={pet.avatar}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <PawPrint className="h-12 w-12 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="p-7">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{pet.name}</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {pet.breed}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    {pet.species}
                  </span>
                </div>
                {pet.medicalConditions && pet.medicalConditions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {pet.medicalConditions.slice(0, 2).map((condition: string) => (
                      <span
                        key={condition}
                        className="text-[10px] px-2 py-1 rounded-full bg-amber-50 text-amber-700"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </UserPageScaffold>
  );
}
