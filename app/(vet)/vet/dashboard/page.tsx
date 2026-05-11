import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

import { demoVets } from "@/lib/demo/publicContent";
import { demoConsultations } from "@/lib/demo/userContent";

export const metadata: Metadata = {
  title: "Vet Dashboard | pawwcure",
};

const stats = [
  {
    icon: DollarSign,
    label: "Today's Earnings",
    tone: "bg-emerald-50 text-emerald-700",
    value: "BDT 4,800",
  },
  {
    icon: Clock,
    label: "Upcoming Sessions",
    tone: "bg-blue-50 text-blue-600",
    value: "3",
  },
  {
    icon: FileText,
    label: "Pending Records",
    tone: "bg-amber-50 text-amber-700",
    value: "2",
  },
  {
    icon: MessageSquare,
    label: "Reviews",
    tone: "bg-teal-50 text-teal-700",
    value: "4.9★",
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

export default function VetDashboardPage() {
  const currentVet = demoVets[0];
  const todaysSessions = demoConsultations.filter(
    (c) => c.status === "Confirmed"
  );

  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-teal-950 p-6 text-white sm:p-8 md:rounded-[3rem] md:p-10">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-100">
              Vet dashboard
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Hi {currentVet.name.split(" ")[1]}, you have 3 sessions today.
            </h1>
            <p className="mt-5 max-w-xl leading-relaxed text-teal-100/70">
              Review your schedule, pending patient notes, recent reviews, and
              earnings from one dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex justify-center rounded-2xl bg-white px-6 py-4 text-sm font-bold text-teal-950 shadow-xl shadow-black/10 transition hover:scale-[1.02] active:scale-95"
                href="/vet/consultations"
              >
                View Schedule
              </Link>
              <Link
                className="inline-flex justify-center rounded-2xl border border-white/15 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                href="/vet/availability"
              >
                Set Availability
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-100/70">
                  Next session
                </p>
                <p className="mt-1 text-xl font-bold">Today, 7:30 PM</p>
              </div>
              <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-100/70">
                  Patient
                </p>
                <p className="mt-1 text-xl font-bold">Luna (Cat)</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-teal-600/25 blur-[100px]" />
        </div>

        <Card className="overflow-hidden p-0">
          <div className="relative h-64">
            <Image
              alt={currentVet.name}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1280px) 35vw, 100vw"
              src={currentVet.avatar}
            />
          </div>
          <div className="p-7">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Vet profile
                </p>
                <h2 className="mt-1 text-3xl font-bold">{currentVet.name}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-400">
                  {currentVet.yearsExperience} years experience
                </p>
              </div>
              <Link
                className="rounded-full bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700"
                href="/vet/profile"
              >
                Edit
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentVet.specialties.map((specialty) => (
                <span
                  className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700"
                  key={specialty}
                >
                  {specialty}
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
                Today&apos;s schedule
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                {todaysSessions.length} confirmed sessions
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            {todaysSessions.map((session) => (
              <div
                className="rounded-[2rem] border border-slate-100 p-5"
                key={session.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {session.scheduledAt}
                    </p>
                    <p className="mt-2 font-bold">{session.petName}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {session.type} consultation
                    </p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700">
                    {session.type}
                  </span>
                </div>
                <Link
                  className="mt-4 inline-block rounded-2xl bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700"
                  href={session.href}
                >
                  Join Session
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Link
              className="inline-flex justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 w-full"
              href="/vet/consultations"
            >
              View All Consultations
            </Link>
          </div>
        </Card>

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Earnings
              </p>
              <h2 className="mt-1 text-2xl font-bold">This Week</h2>
            </div>
            <Link
              className="text-sm font-bold text-teal-600"
              href="/vet/earnings"
            >
              Details
            </Link>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] bg-slate-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total earned
              </p>
              <p className="mt-2 text-3xl font-bold">BDT 24,200</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-bold text-emerald-700">
                <TrendingUp className="h-4 w-4" />
                +12% vs last week
              </p>
            </div>
            <div className="rounded-[2rem] bg-slate-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pending payout
              </p>
              <p className="mt-2 text-2xl font-bold">BDT 12,100</p>
            </div>
            <div className="rounded-[2rem] bg-slate-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Payout scheduled
              </p>
              <p className="mt-2 font-bold">May 10, 2026</p>
            </div>
          </div>

          <Link
            className="mt-6 inline-flex justify-center rounded-2xl bg-teal-600 px-5 py-3 text-sm font-bold text-white w-full transition hover:bg-teal-700"
            href="/vet/earnings"
          >
            Request Payout
          </Link>
        </Card>
      </div>
    </section>
  );
}
