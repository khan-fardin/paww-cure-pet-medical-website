import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { Pet } from "@/lib/db/models/Pet";

type PetPageProps = {
  params: Promise<{ petId: string }>;
};

export const metadata: Metadata = {
  title: "Pet Profile | pawwcure",
};

function calculateAge(dateOfBirth: Date): string {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return `${age} year${age !== 1 ? "s" : ""}`;
}

export default async function PetProfilePage({ params }: PetPageProps) {
  const { petId } = await params;

  let pet = null;
  try {
    pet = await Pet.findById(petId).lean();
  } catch {
    notFound();
  }

  if (!pet || !pet.isActive) {
    notFound();
  }

  const age = calculateAge(new Date(pet.dateOfBirth));

  return (
    <UserPageScaffold
      actionHref={`/vets`}
      actionLabel="Book Consult"
      description="Pet profile with care summary, known conditions, and quick access to health records."
      eyebrow="Pet profile"
      title={pet.name}
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
          <div className="relative h-80">
            {pet.avatar && (
              <Image
                alt={pet.name}
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                src={pet.avatar}
              />
            )}
          </div>
          <div className="p-7">
            <p className="text-2xl font-bold">{pet.breed}</p>
            <p className="mt-1 text-slate-500">
              {age} / {pet.weight} kg
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold">Care summary</h2>
            <div className="space-y-4">
              {pet.medicalConditions && pet.medicalConditions.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-2">Medical Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {pet.medicalConditions.map((condition: string) => (
                      <span
                        className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700"
                        key={condition}
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {pet.allergies && pet.allergies.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-2">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {pet.allergies.map((allergy: string) => (
                      <span
                        className="rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-700"
                        key={allergy}
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-slate-500">Vaccination Status</p>
                <p className="mt-1 text-slate-700">{pet.vaccinationStatus}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              className="rounded-[2rem] bg-emerald-50 p-6 font-bold text-emerald-700"
              href={`/pets/${pet._id?.toString()}/records`}
            >
              Health Records
            </Link>
            <Link
              className="rounded-[2rem] bg-blue-50 p-6 font-bold text-blue-600"
              href={`/pets/${pet._id?.toString()}/prescriptions`}
            >
              Prescriptions
            </Link>
          </div>
        </div>
      </div>
    </UserPageScaffold>
  );
}
