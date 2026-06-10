import type { Metadata } from "next";
import {
  CalendarDays,
  Mail,
  Search,
  Shield,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { ModeratorAssignButton } from "@/components/admin/ModeratorAssignButton";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "Role Management | pawwcure Admin",
};

type AdminRolesPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

type RoleUser = {
  _id: { toString(): string };
  createdAt: Date;
  email: string;
  isActive: boolean;
  name: string;
  phone?: string;
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function roleClass(role: RoleUser["role"]) {
  if (role === "admin") return "bg-rose-100 text-rose-700";
  if (role === "mod") return "bg-amber-100 text-amber-700";
  if (role === "vet") return "bg-teal-100 text-teal-700";
  return "bg-emerald-100 text-emerald-700";
}

export default async function AdminRolesPage({
  searchParams,
}: AdminRolesPageProps) {
  const filters = (await searchParams) ?? {};
  const q = filters.q?.trim() ?? "";

  await dbConnect();

  const userSearchQuery: Record<string, unknown> = q
    ? {
        $or: [
          { email: { $regex: q, $options: "i" } },
          { name: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
        ],
      }
    : { role: "user" };

  const [
    admins,
    moderators,
    users,
    vets,
    moderatorList,
    searchResults,
  ] = await Promise.all([
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ role: "mod" }),
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "vet" }),
    User.find({ role: "mod" })
      .select("name email phone role isActive createdAt")
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean(),
    User.find(userSearchQuery)
      .select("name email phone role isActive createdAt")
      .sort(q ? { role: 1, createdAt: -1 } : { createdAt: -1 })
      .limit(20)
      .lean(),
  ]);

  const moderatorsTyped = moderatorList as unknown as RoleUser[];
  const usersTyped = searchResults as unknown as RoleUser[];

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
            Role Management
          </div>
          <h1 className="text-4xl font-bold">Moderator Authority</h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Search real user accounts and assign moderator access. Once
            assigned, the account role becomes mod in the database.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={ShieldCheck} label="Admins" tone="rose" value={admins} />
        <Stat icon={Shield} label="Moderators" tone="amber" value={moderators} />
        <Stat icon={Users} label="Users" tone="emerald" value={users} />
        <Stat icon={UserRound} label="Vets" tone="teal" value={vets} />
      </div>

      <Card>
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Assign moderator
          </p>
          <h2 className="mt-1 text-2xl font-bold">Find User By Email</h2>
        </div>

        <form
          action="/admin/roles"
          className="grid gap-3 rounded-[2rem] bg-slate-50 p-4 lg:grid-cols-[1fr_auto]"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-bold placeholder-slate-400 outline-none"
              defaultValue={q}
              name="q"
              placeholder="Search email, name, or phone..."
              type="text"
            />
          </div>
          <button
            className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
            type="submit"
          >
            Search
          </button>
        </form>

        <div className="mt-6 divide-y divide-slate-100">
          {usersTyped.map((user) => {
            const id = user._id.toString();
            const isAssignable = user.role === "user";

            return (
              <div
                className="grid gap-5 py-5 lg:grid-cols-[1fr_180px]"
                key={id}
              >
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-lg font-bold text-slate-950">
                      {user.name}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${roleClass(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                    {!user.isActive ? (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700">
                        inactive
                      </span>
                    ) : null}
                  </div>

                  <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-3 w-3 shrink-0" />
                      Joined {formatDate(user.createdAt)}
                    </span>
                  </div>

                  {!isAssignable ? (
                    <p className="mt-3 text-xs font-semibold text-slate-400">
                      Only regular user accounts can be converted to moderator
                      here.
                    </p>
                  ) : null}
                </div>

                <ModeratorAssignButton disabled={!isAssignable} userId={id} />
              </div>
            );
          })}

          {usersTyped.length === 0 ? (
            <div className="py-10 text-center">
              <UserRound className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-bold text-slate-700">No users found</p>
              <p className="mt-1 text-sm text-slate-500">
                Search by the exact email or part of the email address.
              </p>
            </div>
          ) : null}
        </div>
      </Card>

      <Card>
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Current moderators
          </p>
          <h2 className="mt-1 text-2xl font-bold">Moderator Accounts</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {moderatorsTyped.map((moderator) => (
            <div
              className="grid gap-3 py-5 md:grid-cols-[1fr_auto]"
              key={moderator._id.toString()}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-950">
                    {moderator.name}
                  </h3>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    mod
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {moderator.email}
                </p>
              </div>
              <p className="text-sm font-bold text-slate-400 md:text-right">
                Since {formatDate(moderator.createdAt)}
              </p>
            </div>
          ))}

          {moderatorsTyped.length === 0 ? (
            <p className="py-6 text-sm font-semibold text-slate-500">
              No moderator accounts assigned yet.
            </p>
          ) : null}
        </div>
      </Card>
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: "amber" | "emerald" | "rose" | "teal";
  value: number;
}) {
  const tones = {
    amber: "border-amber-100 bg-amber-50 text-amber-900",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-900",
    rose: "border-rose-100 bg-rose-50 text-rose-900",
    teal: "border-teal-100 bg-teal-50 text-teal-900",
  };

  return (
    <div className={`rounded-[2rem] border p-5 ${tones[tone]}`}>
      <Icon className="mb-4 h-5 w-5 opacity-70" />
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
