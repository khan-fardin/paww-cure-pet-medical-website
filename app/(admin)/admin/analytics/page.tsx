import type { Metadata } from "next";
import Link from "next/link";
import {
  Download,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Analytics | pawwcure Admin",
};

const specialties = [
  { name: "Emergency Medicine", demand: 342, percentage: 28 },
  { name: "Orthopedics", demand: 198, percentage: 16 },
  { name: "Dermatology", demand: 176, percentage: 14 },
  { name: "Cardiology", demand: 152, percentage: 12 },
  { name: "Dentistry", demand: 128, percentage: 10 },
  { name: "Surgery", demand: 125, percentage: 10 },
  { name: "Other", demand: 90, percentage: 10 },
];

const topVets = [
  {
    name: "Dr. Amina Parveen",
    consultations: 342,
    revenue: "BDT 156,420",
    rating: 4.8,
  },
  {
    name: "Dr. Ryan Mitchell",
    consultations: 201,
    revenue: "BDT 108,540",
    rating: 4.6,
  },
  {
    name: "Dr. Samuel Cross",
    consultations: 128,
    revenue: "BDT 58,900",
    rating: 4.7,
  },
  {
    name: "Dr. Farzana Khan",
    consultations: 89,
    revenue: "BDT 42,100",
    rating: 4.9,
  },
];

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

export default function AdminAnalyticsPage() {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
            Analytics
          </div>
          <h1 className="text-4xl font-bold">Platform Analytics</h1>
          <p className="mt-2 text-slate-500">
            Track trends, user growth, and platform performance
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          href="#"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
          <Calendar className="h-4 w-4" />
          May 2026
        </button>
        <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Activity className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold">
              <ArrowUpRight className="h-4 w-4" />
              +8.2%
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Consultations
          </p>
          <p className="mt-1 text-3xl font-bold">4,284</p>
          <p className="mt-1 text-xs text-slate-500">This month</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold">
              <ArrowUpRight className="h-4 w-4" />
              +5.2%
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            User Growth
          </p>
          <p className="mt-1 text-3xl font-bold">+142</p>
          <p className="mt-1 text-xs text-slate-500">New users this week</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold">
              <ArrowUpRight className="h-4 w-4" />
              +18%
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Revenue
          </p>
          <p className="mt-1 text-3xl font-bold">BDT 487K</p>
          <p className="mt-1 text-xs text-slate-500">vs last month</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-600 font-bold">
              <ArrowDownRight className="h-4 w-4" />
              -2.1%
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Churn Rate
          </p>
          <p className="mt-1 text-3xl font-bold">2.3%</p>
          <p className="mt-1 text-xs text-slate-500">Inactive users</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-5">
            Consultation Volume
          </p>
          <div className="space-y-3">
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-sm font-bold text-slate-600">Week 1</span>
                <span className="text-xs font-bold text-slate-400">950</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                  style={{ width: "75%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-sm font-bold text-slate-600">Week 2</span>
                <span className="text-xs font-bold text-slate-400">1,050</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                  style={{ width: "84%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-sm font-bold text-slate-600">Week 3</span>
                <span className="text-xs font-bold text-slate-400">1,142</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                  style={{ width: "91%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-sm font-bold text-slate-600">Week 4</span>
                <span className="text-xs font-bold text-slate-400">1,152</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                  style={{ width: "92%" }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-5">
            Revenue Trend
          </p>
          <div className="space-y-3">
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-sm font-bold text-slate-600">Week 1</span>
                <span className="text-xs font-bold text-slate-400">
                  BDT 98K
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                  style={{ width: "70%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-sm font-bold text-slate-600">Week 2</span>
                <span className="text-xs font-bold text-slate-400">
                  BDT 112K
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                  style={{ width: "80%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-sm font-bold text-slate-600">Week 3</span>
                <span className="text-xs font-bold text-slate-400">
                  BDT 135K
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                  style={{ width: "97%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-sm font-bold text-slate-600">Week 4</span>
                <span className="text-xs font-bold text-slate-400">
                  BDT 142K
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-5">
          Specialty Demand
        </p>
        <div className="space-y-3">
          {specialties.map((spec) => (
            <div key={spec.name}>
              <div className="flex items-end justify-between mb-2">
                <span className="text-sm font-bold text-slate-600">
                  {spec.name}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {spec.demand} consultations ({spec.percentage}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full"
                  style={{ width: `${spec.percentage * 3}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Top Vets
          </p>
          <h2 className="mt-1 text-2xl font-bold">Highest Performers</h2>
        </div>

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
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                  key={vet.name}
                >
                  <td className="px-4 py-4 font-bold text-slate-900">
                    <span className="mr-3 text-slate-400">#{idx + 1}</span>
                    {vet.name}
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-slate-900">
                    {vet.consultations}
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-slate-900">
                    {vet.revenue}
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-slate-900">
                    ⭐ {vet.rating}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
