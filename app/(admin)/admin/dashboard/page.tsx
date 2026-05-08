import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  Stethoscope,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard | pawwcure",
};

const stats = [
  {
    icon: DollarSign,
    label: "Revenue (This Month)",
    tone: "bg-emerald-50 text-emerald-700",
    value: "BDT 487,200",
    change: "+18% vs last month",
  },
  {
    icon: Users,
    label: "Active Users",
    tone: "bg-blue-50 text-blue-600",
    value: "2,847",
    change: "+142 this week",
  },
  {
    icon: Stethoscope,
    label: "Consultations Today",
    tone: "bg-purple-50 text-purple-600",
    value: "156",
    change: "+24 vs yesterday",
  },
  {
    icon: Zap,
    label: "Verified Vets",
    tone: "bg-rose-50 text-rose-700",
    value: "94",
    change: "+8 pending approval",
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

export default function AdminDashboardPage() {
  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-rose-950 to-rose-900 p-6 text-white sm:p-8 md:rounded-[3rem] md:p-10">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-100">
              Admin Dashboard
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Platform Control Center
            </h1>
            <p className="mt-5 max-w-xl leading-relaxed text-rose-100/70">
              Manage users, vets, payments, content, and platform settings from
              one centralized dashboard with full admin authority.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex justify-center rounded-2xl bg-white px-6 py-4 text-sm font-bold text-rose-950 shadow-xl shadow-black/10 transition hover:scale-[1.02] active:scale-95"
                href="/admin/users"
              >
                Manage Users
              </Link>
              <Link
                className="inline-flex justify-center rounded-2xl border border-white/15 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                href="/admin/analytics"
              >
                View Analytics
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-100/70">
                  Platform status
                </p>
                <p className="mt-1 text-xl font-bold">All Systems Normal</p>
              </div>
              <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-100/70">
                  Alerts pending
                </p>
                <p className="mt-1 text-xl font-bold">3 items</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-rose-600/25 blur-[100px]" />
        </div>

        <Card className="overflow-hidden p-0">
          <div className="bg-linear-to-br from-rose-100 to-rose-50 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-700 mb-3" />
            <h3 className="text-lg font-bold text-rose-950 mb-2">
              System Alerts
            </h3>
            <p className="text-sm text-rose-900/70 mb-4">
              Important notifications and action items
            </p>
            <div className="space-y-2 text-left">
              <Link
                className="block rounded-2xl bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700 text-center"
                href="/admin/users"
              >
                2 Users Suspended
              </Link>
              <Link
                className="block rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50 text-center"
                href="/admin/payments"
              >
                1 Failed Payment
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
              <p className="mt-2 text-xs text-slate-500">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Revenue
              </p>
              <h2 className="mt-1 text-2xl font-bold">This Week</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] bg-slate-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Revenue
              </p>
              <p className="mt-2 text-3xl font-bold">BDT 156,840</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-bold text-emerald-700">
                <TrendingUp className="h-4 w-4" />
                +12% from last week
              </div>
            </div>

            <div className="rounded-[2rem] bg-slate-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Platform Fee (12%)
              </p>
              <p className="mt-2 text-2xl font-bold">BDT 18,821</p>
            </div>

            <div className="rounded-[2rem] bg-slate-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Vet Payouts Due
              </p>
              <p className="mt-2 text-2xl font-bold">BDT 138,019</p>
              <p className="mt-1 text-xs text-slate-500">Scheduled: May 10, 2026</p>
            </div>
          </div>

          <Link
            className="mt-6 inline-flex justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 w-full transition hover:bg-slate-50"
            href="/admin/payments"
          >
            View Detailed Payments
          </Link>
        </Card>

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Platform metrics
              </p>
              <h2 className="mt-1 text-2xl font-bold">Health Check</h2>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[2rem] bg-emerald-50 p-4 border border-emerald-100">
              <div className="flex items-start gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-emerald-900">All Systems Operational</p>
                  <p className="mt-1 text-xs text-emerald-800">
                    99.98% uptime this month
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-blue-50 p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="h-3 w-3 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-blue-900">User Growth</p>
                  <p className="mt-1 text-xs text-blue-800">
                    +5.2% month-over-month
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-purple-50 p-4 border border-purple-100">
              <div className="flex items-start gap-3">
                <div className="h-3 w-3 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-purple-900">Consultation Volume</p>
                  <p className="mt-1 text-xs text-purple-800">
                    4,284 completed this month
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-amber-50 p-4 border border-amber-100">
              <div className="flex items-start gap-3">
                <div className="h-3 w-3 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-amber-900">Vet Approval Rate</p>
                  <p className="mt-1 text-xs text-amber-800">
                    78% applications approved
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Link
            className="mt-6 inline-flex justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white w-full transition hover:bg-rose-700"
            href="/admin/analytics"
          >
            View Detailed Analytics
          </Link>
        </Card>
      </div>

      <Card>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Quick Actions</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 text-center transition hover:border-rose-300 hover:bg-rose-50"
            href="/admin/users"
          >
            <Users className="mx-auto h-8 w-8 text-slate-400 mb-3" />
            <p className="font-bold text-slate-900">User Management</p>
            <p className="text-xs text-slate-500 mt-1">View, suspend, delete</p>
          </Link>

          <Link
            className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 text-center transition hover:border-rose-300 hover:bg-rose-50"
            href="/admin/vets"
          >
            <Stethoscope className="mx-auto h-8 w-8 text-slate-400 mb-3" />
            <p className="font-bold text-slate-900">Vet Management</p>
            <p className="text-xs text-slate-500 mt-1">Verify, suspend, override</p>
          </Link>

          <Link
            className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 text-center transition hover:border-rose-300 hover:bg-rose-50"
            href="/admin/payments"
          >
            <CreditCard className="mx-auto h-8 w-8 text-slate-400 mb-3" />
            <p className="font-bold text-slate-900">Payments</p>
            <p className="text-xs text-slate-500 mt-1">Revenue, payouts, refunds</p>
          </Link>

          <Link
            className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 text-center transition hover:border-rose-300 hover:bg-rose-50"
            href="/admin/settings"
          >
            <AlertCircle className="mx-auto h-8 w-8 text-slate-400 mb-3" />
            <p className="font-bold text-slate-900">Settings</p>
            <p className="text-xs text-slate-500 mt-1">Config, fees, features</p>
          </Link>
        </div>
      </Card>
    </section>
  );
}
