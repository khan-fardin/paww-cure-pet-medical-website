"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, FileText, PawPrint, Stethoscope, Loader, AlertCircle } from "lucide-react";

import { usePets } from "@/lib/hooks/usePets";
import { useConsultations } from "@/lib/hooks/useConsultations";
import { useReminders } from "@/lib/hooks/useReminders";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { demoVets } from "@/lib/demo/publicContent";
import {
  dashboardTimeline,
} from "@/lib/demo/userContent";

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

export default function UserDashboardPage() {
  const { pets, loading: petsLoading, error: petsError } = usePets();
  const { consultations, loading: consultationsLoading, error: consultationsError } = useConsultations();
  const { reminders, loading: remindersLoading, error: remindersError } = useReminders();
  const { documents, loading: documentsLoading, error: documentsError } = useDocuments();

  const activePet = pets[0];
  const upcomingConsultation = consultations.filter(c => c.status === "scheduled")[0];
  const recommendedVets = demoVets.slice(0, 3);

  const stats = [
    {
      icon: PawPrint,
      label: "Pets",
      tone: "bg-emerald-50 text-emerald-700",
      value: pets.length.toString(),
    },
    {
      icon: Stethoscope,
      label: "Consults",
      tone: "bg-blue-50 text-blue-600",
      value: consultations.length.toString(),
    },
    {
      icon: CalendarDays,
      label: "Reminders",
      tone: "bg-emerald-50 text-emerald-700",
      value: reminders.filter(r => !r.isCompleted).length.toString(),
    },
    {
      icon: FileText,
      label: "Documents",
      tone: "bg-slate-100 text-slate-600",
      value: documents.length.toString(),
    },
  ] as const;

  return (
    <section className="space-y-8">
      {/* Error States */}
      {petsError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <p className="font-bold text-red-900">Failed to load pets</p>
            <p className="text-sm text-red-700">{petsError}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-emerald-950 p-6 text-white sm:p-8 md:rounded-[3rem] md:p-10">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
              User dashboard
            </div>
            
            {petsLoading ? (
              <div className="h-16 bg-white/10 rounded-lg animate-pulse" />
            ) : activePet ? (
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Hi, {activePet.name} is your companion.
              </h1>
            ) : (
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Welcome to pawwcure
              </h1>
            )}
            
            <p className="mt-5 max-w-xl leading-relaxed text-emerald-100/70">
              Review your pets, upcoming consultations, recent records, and reminders
              from one calm workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {upcomingConsultation ? (
                <Link
                  className="inline-flex justify-center rounded-2xl bg-white px-6 py-4 text-sm font-bold text-emerald-950 shadow-xl shadow-black/10 transition hover:scale-[1.02] active:scale-95"
                  href={
                    upcomingConsultation.status === "scheduled"
                      ? `/consultation/${upcomingConsultation._id}/waiting`
                      : `/consultation/${upcomingConsultation._id}`
                  }
                >
                  View Upcoming
                </Link>
              ) : (
                <Link
                  className="inline-flex justify-center rounded-2xl bg-white px-6 py-4 text-sm font-bold text-emerald-950 shadow-xl shadow-black/10 transition hover:scale-[1.02] active:scale-95"
                  href="/vets"
                >
                  Book a Consultation
                </Link>
              )}
              <Link
                className="inline-flex justify-center rounded-2xl border border-white/15 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                href="/vets"
              >
                Find a Vet
              </Link>
            </div>

            {upcomingConsultation && (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                    Next consult
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {new Date(upcomingConsultation.scheduledAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                    Pet
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {upcomingConsultation.petId?.name || "Pet"}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-600/25 blur-[100px]" />
        </div>

        <Card className="overflow-hidden p-0">
          {petsLoading ? (
            <div className="h-96 bg-slate-200 animate-pulse" />
          ) : activePet ? (
            <>
              <div className="relative h-64">
                {activePet.avatar ? (
                  <Image
                    alt={activePet.name}
                    className="object-cover"
                    fill
                    priority
                    sizes="(min-width: 1280px) 35vw, 100vw"
                    src={activePet.avatar}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <PawPrint className="h-16 w-16 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="p-7">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Active pet
                    </p>
                    <h2 className="mt-1 text-3xl font-bold">{activePet.name}</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-400">
                      {activePet.species} / {activePet.breed}
                    </p>
                  </div>
                  <Link
                    className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700"
                    href={`/pets/${activePet._id}`}
                  >
                    Profile
                  </Link>
                </div>
                {activePet.medicalConditions && activePet.medicalConditions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activePet.medicalConditions.map((condition: string) => (
                      <span
                        className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700"
                        key={condition}
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-96 flex items-center justify-center text-center">
              <div>
                <PawPrint className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No pets yet</p>
                <Link href="/pets/new" className="text-emerald-600 text-sm font-bold mt-2 inline-block">
                  Add your first pet
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm"
              key={stat.label}
            >
              <div
                className={`mb-5 flex h-10 w-10 items-center justify-center rounded-2xl ${stat.tone}`}
              >
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {stat.label}
              </p>
              <p className="mt-1 text-3xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          {consultationsLoading ? (
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 rounded animate-pulse w-2/3" />
              <div className="h-4 bg-slate-200 rounded animate-pulse" />
            </div>
          ) : upcomingConsultation ? (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Upcoming consultation
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">
                    {upcomingConsultation.vetId?.name || "Vet"}
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  {upcomingConsultation.status}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Pet", upcomingConsultation.petId?.name || "Pet"],
                  ["Time", new Date(upcomingConsultation.scheduledAt).toLocaleDateString()],
                  ["Type", upcomingConsultation.type],
                ].map(([label, value]) => (
                  <div className="rounded-[2rem] bg-slate-50 p-5" key={label}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {label}
                    </p>
                    <p className="mt-2 text-lg font-bold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex flex-1 justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
                  href={
                    upcomingConsultation.status === "scheduled"
                      ? `/consultation/${upcomingConsultation._id}/waiting`
                      : `/consultation/${upcomingConsultation._id}`
                  }
                >
                  View Details
                </Link>
                <Link
                  className="inline-flex flex-1 justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600"
                  href="/consultations"
                >
                  View All
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Stethoscope className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No upcoming consultations</p>
              <Link href="/vets" className="text-emerald-600 text-sm font-bold mt-2 inline-block">
                Book a consultation
              </Link>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Health timeline
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                {activePet?.name || "Your Pet"}
              </h2>
            </div>
            {activePet && (
              <Link
                className="text-sm font-bold text-emerald-600"
                href={`/pets/${activePet._id}/records`}
              >
                Records
              </Link>
            )}
          </div>

          <div className="space-y-5">
            {dashboardTimeline.map((item) => (
              <div className="flex gap-4" key={`${item.date}-${item.title}`}>
                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {item.date}
                  </p>
                  <h3 className="mt-1 font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Reminders</h2>
            <Link className="text-sm font-bold text-emerald-600" href="/reminders">
              Manage
            </Link>
          </div>
          
          {remindersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-[2rem] animate-pulse" />
              ))}
            </div>
          ) : reminders.length > 0 ? (
            <div className="space-y-3">
              {reminders.filter(r => !r.isCompleted).slice(0, 3).map((reminder) => (
                <div className="rounded-[2rem] bg-slate-50 p-5" key={reminder._id}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {reminder.type} {reminder.petId ? `/ ${reminder.petId.name}` : ""}
                  </p>
                  <p className="mt-2 font-bold">{reminder.title}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {new Date(reminder.dueDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No pending reminders</p>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Documents</h2>
            <Link className="text-sm font-bold text-emerald-600" href="/documents">
              Vault
            </Link>
          </div>
          
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.slice(0, 3).map((document) => (
                <div className="rounded-[2rem] bg-slate-50 p-5" key={document._id}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {document.documentType}
                  </p>
                  <p className="mt-2 font-bold">{document.fileName}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No documents yet</p>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recommended vets</h2>
            <Link className="text-sm font-bold text-emerald-600" href="/vets">
              Browse
            </Link>
          </div>
          <div className="space-y-4">
            {recommendedVets.map((vet) => (
              <Link
                className="flex items-center gap-4 rounded-[2rem] bg-slate-50 p-4 transition hover:bg-emerald-50"
                href={`/vets/${vet.id}`}
                key={vet.id}
              >
                <Image
                  alt={vet.name}
                  className="h-14 w-14 rounded-2xl object-cover"
                  height={56}
                  src={vet.avatar}
                  width={56}
                />
                <div className="min-w-0">
                  <p className="truncate font-bold">{vet.name}</p>
                  <p className="truncate text-sm text-slate-400">
                    {vet.specialties[0]} / {vet.rating}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
