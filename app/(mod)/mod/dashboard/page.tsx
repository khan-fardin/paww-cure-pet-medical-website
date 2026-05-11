import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Flag,
  MessageSquare,
  Users,
} from "lucide-react";

import { demoVets } from "@/lib/demo/publicContent";

export const metadata: Metadata = {
  title: "Moderator Dashboard | pawwcure",
};

const stats = [
  {
    icon: Clock,
    label: "Pending Verifications",
    tone: "bg-amber-50 text-amber-700",
    value: "3",
  },
  {
    icon: Flag,
    label: "Flagged Reviews",
    tone: "bg-red-50 text-red-600",
    value: "2",
  },
  {
    icon: MessageSquare,
    label: "Open Tickets",
    tone: "bg-blue-50 text-blue-600",
    value: "5",
  },
  {
    icon: FileText,
    label: "Articles to Review",
    tone: "bg-purple-50 text-purple-600",
    value: "1",
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

export default function ModDashboardPage() {
  const pendingVets = demoVets.slice(0, 3);

  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-amber-950 p-6 text-white sm:p-8 md:rounded-[3rem] md:p-10">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-100">
              Moderator Dashboard
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Welcome back, you have 5 pending items.
            </h1>
            <p className="mt-5 max-w-xl leading-relaxed text-amber-100/70">
              Review vet applications, flagged content, and support tickets to
              keep the platform safe and trustworthy.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex justify-center rounded-2xl bg-white px-6 py-4 text-sm font-bold text-amber-950 shadow-xl shadow-black/10 transition hover:scale-[1.02] active:scale-95"
                href="/mod/vets"
              >
                Review Vets
              </Link>
              <Link
                className="inline-flex justify-center rounded-2xl border border-white/15 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                href="/mod/flags"
              >
                Check Flags
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-100/70">
                  Pending verifications
                </p>
                <p className="mt-1 text-xl font-bold">3</p>
              </div>
              <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-100/70">
                  Flagged content
                </p>
                <p className="mt-1 text-xl font-bold">2</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-amber-600/25 blur-[100px]" />
        </div>

        <Card className="overflow-hidden p-0">
          <div className="bg-linear-to-br from-amber-100 to-amber-50 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-amber-700 mb-3" />
            <h3 className="text-lg font-bold text-amber-950 mb-2">
              Quick Actions
            </h3>
            <p className="text-sm text-amber-900/70 mb-4">
              Fast track to your most urgent tasks
            </p>
            <div className="space-y-2">
              <Link
                className="block rounded-2xl bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700"
                href="/mod/vets"
              >
                Verify Vets (3)
              </Link>
              <Link
                className="block rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm font-bold text-amber-700 transition hover:bg-amber-50"
                href="/mod/flags"
              >
                Review Flags (2)
              </Link>
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
                Pending vet applications
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                {pendingVets.length} to review
              </h2>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
              Pending
            </span>
          </div>

          <div className="space-y-3">
            {pendingVets.map((vet) => (
              <Link
                className="flex items-center justify-between rounded-[2rem] border border-slate-100 p-4 transition hover:bg-amber-50"
                href="/mod/vets"
                key={vet.id}
              >
                <div className="flex items-center gap-3 flex-1">
                  <img
                    alt={vet.name}
                    className="h-10 w-10 rounded-2xl object-cover"
                    src={vet.avatar}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">{vet.name}</p>
                    <p className="text-xs text-slate-500">
                      {vet.yearsExperience} years experience
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                  Review
                </span>
              </Link>
            ))}
          </div>

          <Link
            className="mt-6 inline-flex justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 w-full transition hover:bg-slate-50"
            href="/mod/vets"
          >
            View All Applications
          </Link>
        </Card>

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recent activity
              </p>
              <h2 className="mt-1 text-2xl font-bold">Today&apos;s Queue</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] bg-red-50 p-4 border border-red-100">
              <div className="flex items-start gap-3">
                <Flag className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900">2 Flagged Reviews</p>
                  <p className="mt-1 text-xs text-red-800">
                    Inappropriate language flagged by users
                  </p>
                </div>
              </div>
              <Link
                className="mt-3 inline-block text-sm font-bold text-red-700 hover:text-red-800"
                href="/mod/flags"
              >
                Review →
              </Link>
            </div>

            <div className="rounded-[2rem] bg-blue-50 p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-900">5 Support Tickets</p>
                  <p className="mt-1 text-xs text-blue-800">
                    4 open, 1 in progress
                  </p>
                </div>
              </div>
              <Link
                className="mt-3 inline-block text-sm font-bold text-blue-700 hover:text-blue-800"
                href="/mod/tickets"
              >
                Review →
              </Link>
            </div>

            <div className="rounded-[2rem] bg-purple-50 p-4 border border-purple-100">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-purple-900">1 Article Waiting</p>
                  <p className="mt-1 text-xs text-purple-800">
                    Pet nutrition guide submitted
                  </p>
                </div>
              </div>
              <Link
                className="mt-3 inline-block text-sm font-bold text-purple-700 hover:text-purple-800"
                href="/mod/content"
              >
                Review →
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
