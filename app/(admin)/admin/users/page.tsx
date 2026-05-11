import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  MoreVertical,
  Shield,
  Trash2,
  Eye,
  LogIn,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export const metadata: Metadata = {
  title: "User Management | pawwcure Admin",
};

const users = [
  {
    id: 1,
    name: "Sarah Ahmed",
    email: "sarah.ahmed@example.com",
    phone: "+880 1712-345678",
    location: "Dhaka, Bangladesh",
    joinDate: "Jan 15, 2026",
    pets: 3,
    status: "active",
    accountValue: "BDT 45,200",
  },
  {
    id: 2,
    name: "Rahman Khan",
    email: "rahman@example.com",
    phone: "+880 1834-567890",
    location: "Chittagong, Bangladesh",
    joinDate: "Feb 22, 2026",
    pets: 1,
    status: "active",
    accountValue: "BDT 12,500",
  },
  {
    id: 3,
    name: "Fatima Begum",
    email: "fatima.b@example.com",
    phone: "+880 1923-456789",
    location: "Sylhet, Bangladesh",
    joinDate: "Mar 10, 2026",
    pets: 2,
    status: "suspended",
    accountValue: "BDT 28,900",
  },
  {
    id: 4,
    name: "Imran Hassan",
    email: "imran.hassan@example.com",
    phone: "+880 1756-234567",
    location: "Dhaka, Bangladesh",
    joinDate: "Apr 3, 2026",
    pets: 4,
    status: "active",
    accountValue: "BDT 67,400",
  },
  {
    id: 5,
    name: "Nadia Islam",
    email: "nadia.islam@example.com",
    phone: "+880 1667-345678",
    location: "Khulna, Bangladesh",
    joinDate: "Apr 18, 2026",
    pets: 2,
    status: "active",
    accountValue: "BDT 19,800",
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

export default function AdminUsersPage() {
  return (
    <section className="space-y-8">
      <div>
        <div className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
          User Management
        </div>
        <h1 className="text-4xl font-bold">Pet user Accounts</h1>
        <p className="mt-2 text-slate-500">
          View, manage, suspend, or delete user accounts
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 p-5">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2 border border-slate-200">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="flex-1 bg-transparent text-sm font-bold placeholder-slate-400 outline-none"
              placeholder="Search users by name or email..."
              type="text"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {users.map((user) => (
            <div
              className="hover:bg-slate-50 transition p-6 flex items-center justify-between gap-4"
              key={user.id}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-slate-900 truncate">{user.name}</h3>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      user.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
                <div className="grid gap-1 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {user.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {user.location}
                  </div>
                </div>
              </div>

              <div className="grid gap-2 text-right text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Pets
                  </p>
                  <p className="text-2xl font-bold">{user.pets}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Account Value
                  </p>
                  <p className="font-bold text-slate-900">{user.accountValue}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  title="View account details"
                  type="button"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  title="Impersonate user"
                  type="button"
                >
                  <LogIn className="h-4 w-4" />
                </button>
                <div className="relative group">
                  <button
                    className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-50"
                    type="button"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  <div className="absolute right-0 top-full z-10 mt-2 w-40 rounded-2xl border border-slate-100 bg-white shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
                    <button className="block w-full px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-t-2xl">
                      Edit account
                    </button>
                    <button className="block w-full px-4 py-3 text-left text-sm font-bold text-amber-700 hover:bg-amber-50">
                      Warn user
                    </button>
                    <button className="block w-full px-4 py-3 text-left text-sm font-bold text-red-700 hover:bg-red-50">
                      Suspend account
                    </button>
                    <button className="block w-full px-4 py-3 text-left text-sm font-bold text-red-700 hover:bg-red-50 rounded-b-2xl">
                      Delete permanently
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Statistics
            </p>
            <h2 className="mt-1 text-2xl font-bold">User Overview</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[2rem] bg-linear-to-br from-emerald-50 to-emerald-100 p-5 border border-emerald-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Total Users
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-900">2,847</p>
            <p className="mt-1 text-xs text-emerald-700/70">+142 this week</p>
          </div>

          <div className="rounded-[2rem] bg-linear-to-br from-blue-50 to-blue-100 p-5 border border-blue-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Active Users
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-900">2,651</p>
            <p className="mt-1 text-xs text-blue-700/70">93.1% of total</p>
          </div>

          <div className="rounded-[2rem] bg-linear-to-br from-amber-50 to-amber-100 p-5 border border-amber-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
              Suspended
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-900">196</p>
            <p className="mt-1 text-xs text-amber-700/70">Pending review</p>
          </div>

          <div className="rounded-[2rem] bg-linear-to-br from-red-50 to-red-100 p-5 border border-red-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">
              Deleted
            </p>
            <p className="mt-2 text-3xl font-bold text-red-900">45</p>
            <p className="mt-1 text-xs text-red-700/70">This month</p>
          </div>
        </div>
      </Card>
    </section>
  );
}
