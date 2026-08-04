import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Download,
  Filter,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { Payment } from "@/lib/db/models/Payment";
import { User } from "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";
import "@/lib/db/models/Pet";

export const metadata: Metadata = {
  title: "Analytics | pawwcure Admin",
};

type CountAggregate = { _id: string; count: number };
type RevenueAggregate = { _id: string; revenue: number };
type SpecialtyAggregate = { _id: string; demand: number };
type TopVetAggregate = {
  _id: string;
  consultations: number;
  name?: string;
  rating?: number;
  revenue?: number;
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

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function formatCurrency(value: number) {
  return `BDT ${Math.round(value).toLocaleString("en-US")}`;
}

function formatCompactCurrency(value: number) {
  if (value >= 1_000_000) return `BDT ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `BDT ${Math.round(value / 1_000)}K`;
  return formatCurrency(value);
}

function formatPercentChange(current: number, previous: number) {
  if (previous === 0 && current === 0) return "0%";
  if (previous === 0) return "+100%";
  const value = ((current - previous) / previous) * 100;
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

function trendTone(current: number, previous: number) {
  return current >= previous ? "text-emerald-700" : "text-slate-600";
}

function trendIcon(current: number, previous: number) {
  return current >= previous ? (
    <ArrowUpRight className="h-4 w-4" />
  ) : (
    <ArrowDownRight className="h-4 w-4" />
  );
}

function weekLabel(index: number) {
  return `Week ${index + 1}`;
}

function makeWeekSeries<T extends { _id: string }>({
  currentMonthStart,
  getValue,
  rows,
}: {
  currentMonthStart: Date;
  getValue: (row: T) => number;
  rows: T[];
}) {
  const values = [0, 0, 0, 0, 0];

  for (const row of rows) {
    const date = new Date(`${row._id}T00:00:00`);
    const week = Math.min(
      4,
      Math.floor((date.getDate() - currentMonthStart.getDate()) / 7)
    );
    values[week] += getValue(row);
  }

  const max = Math.max(...values, 1);

  return values.map((value, index) => ({
    label: weekLabel(index),
    value,
    width: Math.max((value / max) * 100, value > 0 ? 8 : 0),
  }));
}

export default async function AdminAnalyticsPage() {
  await dbConnect();

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const nextMonthStart = endOfMonth(now);
  const previousMonthStart = new Date(
    currentMonthStart.getFullYear(),
    currentMonthStart.getMonth() - 1,
    1
  );
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const [
    consultationsThisMonth,
    consultationsPreviousMonth,
    usersThisWeek,
    usersPreviousWeek,
    totalUsers,
    inactiveUsers,
    revenueThisMonth,
    revenuePreviousMonth,
    weeklyConsultations,
    weeklyRevenue,
    specialties,
    topVets,
  ] = await Promise.all([
    Consultation.countDocuments({
      createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
    }),
    Consultation.countDocuments({
      createdAt: { $gte: previousMonthStart, $lt: currentMonthStart },
    }),
    User.countDocuments({ createdAt: { $gte: weekStart, $lte: now } }),
    User.countDocuments({
      createdAt: {
        $gte: new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000),
        $lt: weekStart,
      },
    }),
    User.countDocuments({}),
    User.countDocuments({ isActive: false }),
    Payment.aggregate<{ total: number }>([
      {
        $match: {
          paidAt: { $gte: currentMonthStart, $lt: nextMonthStart },
          status: "paid",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate<{ total: number }>([
      {
        $match: {
          paidAt: { $gte: previousMonthStart, $lt: currentMonthStart },
          status: "paid",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Consultation.aggregate<CountAggregate>([
      {
        $match: {
          createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
        },
      },
      {
        $group: {
          _id: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Payment.aggregate<RevenueAggregate>([
      {
        $match: {
          paidAt: { $gte: currentMonthStart, $lt: nextMonthStart },
          status: "paid",
        },
      },
      {
        $group: {
          _id: { $dateToString: { date: "$paidAt", format: "%Y-%m-%d" } },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Consultation.aggregate<SpecialtyAggregate>([
      {
        $match: {
          createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
        },
      },
      {
        $lookup: {
          as: "vetProfile",
          foreignField: "userId",
          from: "vetprofiles",
          localField: "vetId",
        },
      },
      { $unwind: "$vetProfile" },
      { $unwind: "$vetProfile.specializations" },
      {
        $group: {
          _id: "$vetProfile.specializations",
          demand: { $sum: 1 },
        },
      },
      { $sort: { demand: -1 } },
      { $limit: 8 },
    ]),
    Consultation.aggregate<TopVetAggregate>([
      {
        $match: {
          createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
        },
      },
      {
        $group: {
          _id: "$vetId",
          consultations: { $sum: 1 },
        },
      },
      {
        $lookup: {
          as: "user",
          foreignField: "_id",
          from: "users",
          localField: "_id",
        },
      },
      {
        $lookup: {
          as: "profile",
          foreignField: "userId",
          from: "vetprofiles",
          localField: "_id",
        },
      },
      {
        $lookup: {
          as: "payments",
          foreignField: "vetId",
          from: "payments",
          localField: "_id",
        },
      },
      {
        $project: {
          consultations: 1,
          name: { $arrayElemAt: ["$user.name", 0] },
          rating: { $arrayElemAt: ["$profile.averageRating", 0] },
          revenue: {
            $sum: {
              $map: {
                as: "payment",
                in: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$$payment.status", "paid"] },
                        { $gte: ["$$payment.paidAt", currentMonthStart] },
                        { $lt: ["$$payment.paidAt", nextMonthStart] },
                      ],
                    },
                    "$$payment.amount",
                    0,
                  ],
                },
                input: "$payments",
              },
            },
          },
        },
      },
      { $sort: { consultations: -1, revenue: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const currentRevenue = revenueThisMonth[0]?.total ?? 0;
  const previousRevenue = revenuePreviousMonth[0]?.total ?? 0;
  const churnRate = totalUsers > 0 ? (inactiveUsers / totalUsers) * 100 : 0;
  const consultationSeries = makeWeekSeries({
    currentMonthStart,
    getValue: (row: CountAggregate) => row.count,
    rows: weeklyConsultations,
  });
  const revenueSeries = makeWeekSeries({
    currentMonthStart,
    getValue: (row: RevenueAggregate) => row.revenue,
    rows: weeklyRevenue,
  });
  const totalSpecialtyDemand = specialties.reduce(
    (sum, item) => sum + item.demand,
    0
  );

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
            Analytics
          </div>
          <h1 className="text-4xl font-bold">Platform Analytics</h1>
          <p className="mt-2 text-slate-500">
            Real platform trends from users, consultations, vets, and payments.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          href="/api/admin/analytics/export"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600">
          <Calendar className="h-4 w-4" />
          {now.toLocaleString("en-US", { month: "long", year: "numeric" })}
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600">
          <Filter className="h-4 w-4" />
          Paid revenue / active data
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          current={consultationsThisMonth}
          icon={<Activity className="h-5 w-5" />}
          label="Consultations"
          note="This month"
          previous={consultationsPreviousMonth}
          tone="emerald"
          value={consultationsThisMonth.toLocaleString("en-US")}
        />
        <MetricCard
          current={usersThisWeek}
          icon={<Users className="h-5 w-5" />}
          label="User Growth"
          note="New users this week"
          previous={usersPreviousWeek}
          tone="blue"
          value={`+${usersThisWeek.toLocaleString("en-US")}`}
        />
        <MetricCard
          current={currentRevenue}
          icon={<TrendingUp className="h-5 w-5" />}
          label="Revenue"
          note="Paid this month"
          previous={previousRevenue}
          tone="purple"
          value={formatCompactCurrency(currentRevenue)}
        />
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
              {inactiveUsers.toLocaleString("en-US")} inactive
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Inactive Rate
          </p>
          <p className="mt-1 text-3xl font-bold">{churnRate.toFixed(1)}%</p>
          <p className="mt-1 text-xs text-slate-500">
            Out of {totalUsers.toLocaleString("en-US")} accounts
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SeriesCard
          color="emerald"
          items={consultationSeries}
          title="Consultation Volume"
          valueFormatter={(value) => value.toLocaleString("en-US")}
        />
        <SeriesCard
          color="purple"
          items={revenueSeries}
          title="Revenue Trend"
          valueFormatter={formatCompactCurrency}
        />
      </div>

      <Card>
        <p className="mb-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Specialty Demand
        </p>
        {specialties.length > 0 ? (
          <div className="space-y-3">
            {specialties.map((spec) => {
              const percentage =
                totalSpecialtyDemand > 0
                  ? (spec.demand / totalSpecialtyDemand) * 100
                  : 0;

              return (
                <div key={spec._id}>
                  <div className="mb-2 flex items-end justify-between gap-4">
                    <span className="text-sm font-bold text-slate-600">
                      {spec._id}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {spec.demand} consultation
                      {spec.demand === 1 ? "" : "s"} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-rose-400 to-rose-600"
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState text="No specialty demand yet. Completed bookings will populate this chart." />
        )}
      </Card>

      <Card>
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Top Vets
          </p>
          <h2 className="mt-1 text-2xl font-bold">Highest Performers</h2>
        </div>

        {topVets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left font-bold text-slate-600">
                    Vet
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-slate-600">
                    Consultations
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-slate-600">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-slate-600">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                {topVets.map((vet, idx) => (
                  <tr
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                    key={vet._id.toString()}
                  >
                    <td className="px-4 py-4 font-bold text-slate-900">
                      <span className="mr-3 text-slate-400">#{idx + 1}</span>
                      {vet.name ?? "Unknown vet"}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-900">
                      {vet.consultations.toLocaleString("en-US")}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-900">
                      {formatCurrency(vet.revenue ?? 0)}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-900">
                      <span className="inline-flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {(vet.rating ?? 0).toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState text="No vet performance data yet for this month." />
        )}
      </Card>
    </section>
  );
}

function MetricCard({
  icon,
  current,
  label,
  note,
  previous,
  tone,
  value,
}: {
  current: number;
  icon: React.ReactNode;
  label: string;
  note: string;
  previous: number;
  tone: "blue" | "emerald" | "purple";
  value: string;
}) {
  const toneClass = {
    blue: "bg-blue-100 text-blue-700",
    emerald: "bg-emerald-100 text-emerald-700",
    purple: "bg-purple-100 text-purple-700",
  }[tone];
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}
        >
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-bold ${trendTone(
            current,
            previous
          )}`}
        >
          {trendIcon(current, previous)}
          {formatPercentChange(current, previous)}
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </Card>
  );
}

function SeriesCard({
  color,
  items,
  title,
  valueFormatter,
}: {
  color: "emerald" | "purple";
  items: { label: string; value: number; width: number }[];
  title: string;
  valueFormatter: (value: number) => string;
}) {
  const colorClass =
    color === "emerald"
      ? "from-emerald-400 to-emerald-600"
      : "from-purple-400 to-purple-600";

  return (
    <Card>
      <p className="mb-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-end justify-between">
              <span className="text-sm font-bold text-slate-600">
                {item.label}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {valueFormatter(item.value)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full bg-linear-to-r ${colorClass}`}
                style={{ width: `${item.width}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-500">
      {text}
    </div>
  );
}
