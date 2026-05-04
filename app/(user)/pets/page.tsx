import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { demoPets } from "@/lib/demo/userContent";

export const metadata: Metadata = {
  title: "Pets | pawwcure",
};

export default function PetsPage() {
  return (
    <UserPageScaffold
      actionHref="/pets/new"
      actionLabel="Add Pet"
      description="Manage pet profiles, conditions, records, prescriptions, and reminders from one place."
      eyebrow="Pet profiles"
      title="Pets"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {demoPets.map((pet) => (
          <Link
            className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]"
            href={`/pets/${pet.id}`}
            key={pet.id}
          >
            <div className="relative h-64">
              <Image
                alt={pet.name}
                className="object-cover"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                src={pet.avatar}
              />
            </div>
            <div className="p-7">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{pet.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {pet.breed} / {pet.age}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  {pet.species}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Last visit: {pet.lastVisit}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </UserPageScaffold>
  );
}
