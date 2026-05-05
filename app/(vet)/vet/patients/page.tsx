import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Stethoscope } from "lucide-react";

import { demoPets } from "@/lib/demo/userContent";

export const metadata: Metadata = {
  title: "My Patients | pawwcure",
};

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default function PatientsPage() {
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Patients</h1>
        <p className="mt-2 text-slate-500">
          Complete history of all patients you have treated
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {demoPets.map((pet) => (
          <Card key={pet.id}>
            <div className="mb-4">
              <div className="relative h-48 w-full mb-4 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  alt={pet.name}
                  className="object-cover w-full h-full"
                  src={pet.avatar}
                />
              </div>
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Patient
                </p>
                <h3 className="mt-1 text-2xl font-bold">{pet.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {pet.species} • {pet.breed}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Last visit: {pet.lastVisit}</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Age: {pet.age}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Link
                className="flex-1 rounded-2xl bg-teal-600 px-4 py-2 text-center text-sm font-bold text-white transition hover:bg-teal-700"
                href={`/vet/consultations`}
              >
                View History
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
