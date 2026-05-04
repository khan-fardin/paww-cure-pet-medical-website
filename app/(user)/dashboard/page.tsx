import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, FileText, PawPrint, Stethoscope } from "lucide-react";

import { demoVets } from "@/lib/demo/publicContent";
import {
  dashboardTimeline,
  demoConsultations,
  demoDocuments,
  demoPets,
  demoReminders,
  demoUser,
} from "@/lib/demo/userContent";

export const metadata: Metadata = {
  title: "Dashboard | pawwcure",
};

const stats = [
  {
    icon: PawPrint,
    label: "Pets",
    tone: "bg-emerald-50 text-emerald-700",
    value: demoPets.length.toString(),
  },
  {
    icon: Stethoscope,
    label: "Consults",
    tone: "bg-blue-50 text-blue-600",
    value: "12",
  },
  {
    icon: CalendarDays,
    label: "Reminders",
    tone: "bg-emerald-50 text-emerald-700",
    value: demoReminders.length.toString(),
  },
  {
    icon: FileText,
    label: "Documents",
    tone: "bg-slate-100 text-slate-600",
    value: demoDocuments.length.toString(),
  },
] as const;

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
  const activePet =
    demoPets.find((pet) => pet.id === demoUser.activePetId) ?? demoPets[0];
  const upcomingConsultation = demoConsultations[0];
  const recommendedVets = demoVets.slice(0, 3);

  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-emerald-950 p-6 text-white sm:p-8 md:rounded-[3rem] md:p-10">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
              User dashboard
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Hi {demoUser.name.split(" ")[0]}, Luna has a consult today.
            </h1>
            <p className="mt-5 max-w-xl leading-relaxed text-emerald-100/70">
              Review the waiting room, recent records, and upcoming reminders
              from one calm workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex justify-center rounded-2xl bg-white px-6 py-4 text-sm font-bold text-emerald-950 shadow-xl shadow-black/10 transition hover:scale-[1.02] active:scale-95"
                href={upcomingConsultation.href}
              >
                Enter Waiting Room
              </Link>
              <Link
                className="inline-flex justify-center rounded-2xl border border-white/15 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                href="/vets"
              >
                Find a Vet
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                  Next consult
                </p>
                <p className="mt-1 text-xl font-bold">
                  {upcomingConsultation.scheduledAt}
                </p>
              </div>
              <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                  Pet
                </p>
                <p className="mt-1 text-xl font-bold">
                  {upcomingConsultation.petName}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-600/25 blur-[100px]" />
        </div>

        <Card className="overflow-hidden p-0">
          <div className="relative h-64">
            <Image
              alt={activePet.name}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1280px) 35vw, 100vw"
              src={activePet.avatar}
            />
          </div>
          <div className="p-7">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active pet
                </p>
                <h2 className="mt-1 text-3xl font-bold">{activePet.name}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-400">
                  {activePet.breed} / {activePet.age}
                </p>
              </div>
              <Link
                className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700"
                href={`/pets/${activePet.id}`}
              >
                Profile
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {activePet.conditions.map((condition) => (
                <span
                  className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700"
                  key={condition}
                >
                  {condition}
                </span>
              ))}
            </div>
          </div>
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
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Upcoming consultation
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                {upcomingConsultation.vetName}
              </h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              {upcomingConsultation.status}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Pet", upcomingConsultation.petName],
              ["Time", upcomingConsultation.scheduledAt],
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
              href={upcomingConsultation.href}
            >
              Prepare Session
            </Link>
            <Link
              className="inline-flex flex-1 justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600"
              href="/consultations"
            >
              View All
            </Link>
          </div>
        </Card>

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Health timeline
              </p>
              <h2 className="mt-1 text-2xl font-bold">{activePet.name}</h2>
            </div>
            <Link
              className="text-sm font-bold text-emerald-600"
              href={`/pets/${activePet.id}/records`}
            >
              Records
            </Link>
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
          <div className="space-y-3">
            {demoReminders.map((reminder) => (
              <div className="rounded-[2rem] bg-slate-50 p-5" key={reminder.id}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {reminder.type} / {reminder.petName}
                </p>
                <p className="mt-2 font-bold">{reminder.title}</p>
                <p className="mt-1 text-sm text-slate-400">{reminder.dueAt}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Documents</h2>
            <Link className="text-sm font-bold text-emerald-600" href="/documents">
              Vault
            </Link>
          </div>
          <div className="space-y-3">
            {demoDocuments.map((document) => (
              <div className="rounded-[2rem] bg-slate-50 p-5" key={document.id}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {document.petName}
                </p>
                <p className="mt-2 font-bold">{document.label}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {document.uploadedAt}
                </p>
              </div>
            ))}
          </div>
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
