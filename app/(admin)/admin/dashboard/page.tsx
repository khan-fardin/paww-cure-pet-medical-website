import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  CreditCard,
  DollarSign,
  FileText,
  Stethoscope,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { Document } from "@/lib/db/models/Document";
import { Pet } from "@/lib/db/models/Pet";
import { Reminder } from "@/lib/db/models/Reminder";
import { Review } from "@/lib/db/models/Review";
import { User } from "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";

export const metadata: Metadata = {
  title: "Admin Dashboard | pawwcure",
};

type RecentUser = {
  _id: { toString(): string };
  createdAt: Date;
  email: string;
  isActive: boolean;
  name: string;
  role: "admin" | "mod" | "user" | "vet";
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

function formatBDT(value: number) {
  return `BDT ${new Intl.NumberFormat("en-BD").format(value)}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default async function AdminDashboardPage() {
  await dbConnect();

  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const monthStart = startOfMonth(now);

  const [
    totalUsers,
    activeUsers,
    totalPets,
    totalVets,
    verifiedVets,
    pendingVets,
    consultationsToday,
    completedThisMonth,
    failedPayments,
    dueReminders,
    documentCount,
    hiddenReviews,
    revenueRows,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "user", isActive: true }),
    Pet.countDocuments({ isActive: true }),
    VetProfile.countDocuments({}),
    VetProfile.countDocuments({ isVerified: true }),
    VetProfile.countDocuments({ applicationStatus: "submitted" }),
    Consultation.countDocuments({
      scheduledAt: { $gte: today, $lt: tomorrow },
    }),
    Consultation.countDocuments({
      completedAt: { $gte: monthStart },
      status: "completed",
    }),
    Consultation.countDocuments({ paymentStatus: "failed" }),
    Reminder.countDocuments({ dueDate: { $lte: tomorrow }, isCompleted: false }),
    Document.countDocuments({}),
    Review.countDocuments({ isVisible: false }),
    Consultation.aggregate<{ total: number }>([
      {
        $match: {
          createdAt: { $gte: monthStart },
          paymentStatus: "completed",
        },
      },
      { $group: { _id: null, total: { $sum: "$fees.total" } } },
    ]),
    User.find({})
      .select("name email role isActive createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const monthRevenue = revenueRows[0]?.total ?? 0;
  const platformFee = Math.round(monthRevenue * 0.12);
  const vetPayouts = Math.max(monthRevenue - platformFee, 0);
  const alertsPending = pendingVets + failedPayments + hiddenReviews;

  const stats = [
    {
      icon: DollarSign,
      label: "Revenue This Month",
      tone: "bg-emerald-50 text-emerald-700",
      value: formatBDT(monthRevenue),
      change: `${formatBDT(platformFee)} platform fee`,
    },
    {
      icon: Users,
      label: "Active Users",
      tone: "bg-blue-50 text-blue-600",
      value: activeUsers.toString(),
      change: `${totalUsers} total user accounts`,
    },
    {
      icon: Stethoscope,
      label: "Consultations Today",
      tone: "bg-purple-50 text-purple-600",
      value: consultationsToday.toString(),
      change: `${completedThisMonth} completed this month`,
    },
    {
      icon: Zap,
      label: "Verified Vets",
      tone: "bg-rose-50 text-rose-700",
      value: verifiedVets.toString(),
      change: `${pendingVets} pending approval`,
    },
  ] as const;

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
              Live operational view across users, vets, consultations, payments,
              documents, and moderation.
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
                href="/admin/vets"
              >
                Review Vets
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
                <p className="mt-1 text-xl font-bold">{alertsPending} items</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-rose-600/25 blur-[100px]" />
        </div>

        <Card className="overflow-hidden p-0">
          <div className="bg-linear-to-br from-rose-100 to-rose-50 p-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-12 w-12 text-rose-700" />
            <h3 className="mb-2 text-lg font-bold text-rose-950">
              System Alerts
            </h3>
            <p className="mb-4 text-sm text-rose-900/70">
              Important action items from live platform data.
            </p>
            <div className="space-y-2 text-left">
              <Link
                className="block rounded-2xl bg-rose-600 px-4 py-2 text-center text-sm font-bold text-white transition hover:bg-rose-700"
                href="/admin/vets"
              >
                {pendingVets} Vet Applications
              </Link>
              <Link
                className="block rounded-2xl border border-rose-200 bg-white px-4 py-2 text-center text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                href="/admin/payments"
              >
                {failedPayments} Failed Payments
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
              <h2 className="mt-1 text-2xl font-bold">This Month</h2>
            </div>
          </div>

          <div className="space-y-4">
            <Metric
              detail="Completed payments from consultation fees"
              icon={TrendingUp}
              label="Total Revenue"
              value={formatBDT(monthRevenue)}
            />
            <Metric
              detail="Estimated platform share at 12%"
              icon={CreditCard}
              label="Platform Fee"
              value={formatBDT(platformFee)}
            />
            <Metric
              detail="Estimated amount available for vet payouts"
              icon={DollarSign}
              label="Vet Payouts Due"
              value={formatBDT(vetPayouts)}
            />
          </div>

          <Link
            className="mt-6 inline-flex w-full justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
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

          <div className="grid gap-3 sm:grid-cols-2">
            <Health label="Total vets" tone="emerald" value={totalVets} />
            <Health label="Active pets" tone="blue" value={totalPets} />
            <Health label="Due reminders" tone="amber" value={dueReminders} />
            <Health label="Documents" tone="purple" value={documentCount} />
          </div>

          <div className="mt-6 rounded-[2rem] bg-slate-50 p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Recent accounts
            </p>
            <div className="mt-4 space-y-3">
              {(recentUsers as unknown as RecentUser[]).map((user) => (
                <div
                  className="flex items-center justify-between gap-4"
                  key={user._id.toString()}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Quick Actions</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            detail="View status and roles"
            href="/admin/users"
            icon={Users}
            label="User Management"
          />
          <QuickAction
            detail="Verify applications"
            href="/admin/vets"
            icon={Stethoscope}
            label="Vet Management"
          />
          <QuickAction
            detail="Revenue and payouts"
            href="/admin/payments"
            icon={CreditCard}
            label="Payments"
          />
          <QuickAction
            detail="Records and uploads"
            href="/admin/content"
            icon={FileText}
            label="Content"
          />
        </div>
      </Card>
    </section>
  );
}

function Metric({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string;
  icon: typeof TrendingUp;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[2rem] bg-slate-50 p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-rose-700">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function Health({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "amber" | "blue" | "emerald" | "purple";
  value: number;
}) {
  const tones = {
    amber: "border-amber-100 bg-amber-50 text-amber-900",
    blue: "border-blue-100 bg-blue-50 text-blue-900",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-900",
    purple: "border-purple-100 bg-purple-50 text-purple-900",
  };

  return (
    <div className={`rounded-[2rem] border p-5 ${tones[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function QuickAction({
  detail,
  href,
  icon: Icon,
  label,
}: {
  detail: string;
  href: string;
  icon: typeof Users;
  label: string;
}) {
  return (
    <Link
      className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 text-center transition hover:border-rose-300 hover:bg-rose-50"
      href={href}
    >
      <Icon className="mx-auto mb-3 h-8 w-8 text-slate-400" />
      <p className="font-bold text-slate-900">{label}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </Link>
  );
}
