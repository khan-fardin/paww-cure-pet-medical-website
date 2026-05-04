import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { getDemoPet } from "@/lib/demo/userContent";

type PetPageProps = {
  params: Promise<{ petId: string }>;
};

export const metadata: Metadata = {
  title: "Pet Profile | pawwcure",
};

export default async function PetProfilePage({ params }: PetPageProps) {
  const { petId } = await params;
  const pet = getDemoPet(petId);

  if (!pet) {
    notFound();
  }

  return (
    <UserPageScaffold
      actionHref={`/book/amina-rahman`}
      actionLabel="Book Consult"
      description="Pet profile skeleton with care summary, known conditions, and quick access to health records."
      eyebrow="Pet profile"
      title={pet.name}
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
          <div className="relative h-80">
            <Image
              alt={pet.name}
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              src={pet.avatar}
            />
          </div>
          <div className="p-7">
            <p className="text-2xl font-bold">{pet.breed}</p>
            <p className="mt-1 text-slate-500">
              {pet.age} / {pet.weight}
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold">Care summary</h2>
            <div className="flex flex-wrap gap-2">
              {pet.conditions.map((condition) => (
                <span
                  className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700"
                  key={condition}
                >
                  {condition}
                </span>
              ))}
            </div>
            <p className="mt-5 text-slate-500">Last visit: {pet.lastVisit}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              className="rounded-[2rem] bg-emerald-50 p-6 font-bold text-emerald-700"
              href={`/pets/${pet.id}/records`}
            >
              Health Records
            </Link>
            <Link
              className="rounded-[2rem] bg-blue-50 p-6 font-bold text-blue-600"
              href={`/pets/${pet.id}/prescriptions`}
            >
              Prescriptions
            </Link>
          </div>
        </div>
      </div>
    </UserPageScaffold>
  );
}
