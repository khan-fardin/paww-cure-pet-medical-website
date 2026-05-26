import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Cat,
  Eye,
  Mail,
  Phone,
  Search,
  Shield,
  UserRound,
} from "lucide-react";

import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { Pet } from "@/lib/db/models/Pet";
import { User } from "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";

export const metadata: Metadata = {
  title: "User Management | pawwcure Admin",
};

type AdminUsersPageProps = {
  searchParams?: Promise<{
    q?: string;
    role?: string;
    status?: string;
  }>;
};

type AdminUser = {
  _id: { toString(): string };
  avatar?: string;
  createdAt: Date;
  email: string;
  isActive: boolean;
  name: string;
  phone?: string;
  role: "admin" | "mod" | "user" | "vet";
};

type CountRow = {
  _id: { toString(): string };
  count: number;
};

type ApprovedVetRow = {
  userId: { toString(): string };
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusClass(isActive: boolean) {
  return isActive
    ? "bg-emerald-100 text-emerald-700"
    : "bg-red-100 text-red-700";
}

function roleClass(role: AdminUser["role"]) {
  if (role === "admin") return "bg-rose-100 text-rose-700";
  if (role === "mod") return "bg-amber-100 text-amber-700";
  if (role === "vet") return "bg-teal-100 text-teal-700";
  return "bg-emerald-100 text-emerald-700";
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const filters = (await searchParams) ?? {};
  const q = filters.q?.trim() ?? "";
  const role = filters.role ?? "all";
  const status = filters.status ?? "all";

  await dbConnect();

  const approvedVetProfiles = await VetProfile.find({
    applicationStatus: "approved",
    isVerified: true,
  })
    .select("userId")
    .lean<ApprovedVetRow[]>();

  const approvedVetIds = approvedVetProfiles.map((profile) => profile.userId);

  if (approvedVetIds.length > 0) {
    await User.updateMany(
      {
        _id: { $in: approvedVetIds },
        role: "user",
      },
      { $set: { role: "vet" } }
    );
  }

  const query: Record<string, unknown> = {};

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
    ];
  }

  if (["user", "vet", "mod", "admin"].includes(role)) {
    query.role = role;
  }

  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;

  const [users, totalUsers, activeUsers, inactiveUsers, vets, petRows, spendRows] =
    await Promise.all([
      User.find(query)
        .select("name email phone role isActive avatar createdAt")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", isActive: true }),
      User.countDocuments({ role: "user", isActive: false }),
      User.countDocuments({ role: "vet" }),
      Pet.aggregate<CountRow>([
        { $group: { _id: "$userId", count: { $sum: 1 } } },
      ]),
      Consultation.aggregate<{ _id: { toString(): string }; total: number }>([
        { $match: { paymentStatus: "completed" } },
        { $group: { _id: "$userId", total: { $sum: "$fees.total" } } },
      ]),
    ]);

  const petCounts = new Map(
    petRows.map((row) => [row._id.toString(), row.count])
  );
  const spendTotals = new Map(
    spendRows.map((row) => [row._id.toString(), row.total])
  );

  return (
    <section className="space-y-8">
      <div>
        <div className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
          User Management
        </div>
        <h1 className="text-4xl font-bold">Platform Accounts</h1>
        <p className="mt-2 text-slate-500">
          Search, inspect, and monitor users across every platform role.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Pet users" tone="emerald" value={totalUsers} />
        <Stat label="Active users" tone="blue" value={activeUsers} />
        <Stat label="Inactive users" tone="amber" value={inactiveUsers} />
        <Stat label="Vet accounts" tone="rose" value={vets} />
      </div>

      <Card className="overflow-hidden p-0">
        <form
          className="grid gap-3 border-b border-slate-100 bg-slate-50 p-5 lg:grid-cols-[1fr_180px_180px_auto]"
          action="/admin/users"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="flex-1 bg-transparent text-sm font-bold placeholder-slate-400 outline-none"
              defaultValue={q}
              name="q"
              placeholder="Search name, email, or phone..."
              type="text"
            />
          </div>

          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 outline-none"
            defaultValue={role}
            name="role"
          >
            <option value="all">All roles</option>
            <option value="user">Users</option>
            <option value="vet">Vets</option>
            <option value="mod">Moderators</option>
            <option value="admin">Admins</option>
          </select>

          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 outline-none"
            defaultValue={status}
            name="status"
          >
            <option value="all">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            className="rounded-2xl bg-rose-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-rose-700"
            type="submit"
          >
            Apply
          </button>
        </form>

        <div className="divide-y divide-slate-100">
          {(users as unknown as AdminUser[]).map((user) => {
            const userId = user._id.toString();
            const petCount = petCounts.get(userId) ?? 0;
            const spend = spendTotals.get(userId) ?? 0;
            const effectiveRole = user.role;

            return (
              <div
                className="grid gap-5 p-5 transition hover:bg-slate-50 lg:grid-cols-[1fr_160px_170px_112px]"
                key={userId}
              >
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-lg font-bold text-slate-900">
                      {user.name}
                    </h3>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${roleClass(
                        effectiveRole
                      )}`}
                    >
                      {effectiveRole}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(
                        user.isActive
                      )}`}
                    >
                      {user.isActive ? "active" : "inactive"}
                    </span>
                  </div>

                  <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Phone className="h-3 w-3 shrink-0" />
                      {user.phone || "No phone"}
                    </span>
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-3 w-3 shrink-0" />
                      Joined {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pets
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-2xl font-bold">
                    <Cat className="h-5 w-5 text-slate-400" />
                    {petCount}
                  </p>
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Account Value
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    BDT {new Intl.NumberFormat("en-BD").format(spend)}
                  </p>
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  <Link
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                    href={`/admin/users?id=${userId}`}
                    title="View account details"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                    title="Role controls"
                    type="button"
                  >
                    <Shield className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {users.length === 0 ? (
            <div className="p-10 text-center">
              <UserRound className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-bold text-slate-700">No accounts found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try a different search term or role filter.
              </p>
            </div>
          ) : null}
        </div>
      </Card>
    </section>
  );
}

function Stat({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "amber" | "blue" | "emerald" | "rose";
  value: number;
}) {
  const tones = {
    amber: "border-amber-100 bg-amber-50 text-amber-900",
    blue: "border-blue-100 bg-blue-50 text-blue-900",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-900",
    rose: "border-rose-100 bg-rose-50 text-rose-900",
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
