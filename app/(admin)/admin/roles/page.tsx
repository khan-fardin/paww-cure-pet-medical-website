import type { Metadata } from "next";
import Link from "next/link";
import {
  Plus,
  Shield,
  Edit,
  ArrowUp,
  Trash2,
  CheckCircle,
  Clock,
  MoreVertical,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Role Management | pawwcure Admin",
};

const roleAssignments = [
  {
    id: 1,
    name: "Md. Karim Hassan",
    email: "karim@moderator.com",
    currentRole: "Moderator",
    assignedDate: "Mar 15, 2026",
    activity: "Flag reviews, verify vets",
    escalations: 12,
  },
  {
    id: 2,
    name: "Sarah Thompson",
    email: "sarah@moderator.com",
    currentRole: "Moderator",
    assignedDate: "Feb 8, 2026",
    activity: "Review content, support tickets",
    escalations: 5,
  },
  {
    id: 3,
    name: "Dr. Farzana Khan",
    email: "farzana@veterinary.com",
    currentRole: "Vet + Moderator",
    assignedDate: "Jan 22, 2026",
    activity: "Full moderator + vet services",
    escalations: 3,
  },
  {
    id: 4,
    name: "Ahmad Ali Khan",
    email: "ahmad@moderator.com",
    currentRole: "Moderator",
    assignedDate: "Apr 10, 2026",
    activity: "Content review, user support",
    escalations: 8,
  },
];

const auditLog = [
  {
    id: 1,
    action: "Promoted to Moderator",
    user: "Md. Karim Hassan",
    by: "Admin System",
    date: "Mar 15, 2026",
    time: "10:30 AM",
  },
  {
    id: 2,
    action: "Role changed: Moderator → Admin",
    user: "Sarah Thompson",
    by: "Super Admin",
    date: "Feb 20, 2026",
    time: "3:45 PM",
  },
  {
    id: 3,
    action: "Assigned Moderator role",
    user: "Dr. Farzana Khan",
    by: "Admin System",
    date: "Jan 22, 2026",
    time: "11:15 AM",
  },
  {
    id: 4,
    action: "Role revoked",
    user: "John Smith",
    by: "Super Admin",
    date: "Jan 15, 2026",
    time: "2:20 PM",
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

export default function AdminRolesPage() {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
            Role Management
          </div>
          <h1 className="text-4xl font-bold">Admin Roles</h1>
          <p className="mt-2 text-slate-500">
            Manage moderator assignments and role-based access control
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-rose-700"
          href="#"
        >
          <Plus className="h-4 w-4" />
          Assign Role
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
            Total Admins
          </p>
          <p className="text-4xl font-bold mb-2">1</p>
          <p className="text-xs text-slate-500">Super Admin</p>
        </Card>

        <Card>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
            Moderators
          </p>
          <p className="text-4xl font-bold mb-2">4</p>
          <p className="text-xs text-slate-500">Active roles assigned</p>
        </Card>

        <Card>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
            Role Changes
          </p>
          <p className="text-4xl font-bold mb-2">12</p>
          <p className="text-xs text-slate-500">This month</p>
        </Card>
      </div>

      <Card>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Team
            </p>
            <h2 className="mt-1 text-2xl font-bold">Role Assignments</h2>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {roleAssignments.map((role) => (
            <div
              className="hover:bg-slate-50 transition p-6 flex items-center justify-between gap-4"
              key={role.id}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-slate-900">{role.name}</h3>
                  <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                    {role.currentRole}
                  </span>
                </div>
                <div className="grid gap-1 text-xs text-slate-500">
                  <p>{role.email}</p>
                  <p>{role.activity}</p>
                  <p>Assigned: {role.assignedDate}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Escalations
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {role.escalations}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-50"
                  title="Edit role"
                  type="button"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-50"
                  title="Promote to admin"
                  type="button"
                >
                  <ArrowUp className="h-4 w-4" />
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
                      View activity
                    </button>
                    <button className="block w-full px-4 py-3 text-left text-sm font-bold text-blue-700 hover:bg-blue-50">
                      Modify permissions
                    </button>
                    <button className="block w-full px-4 py-3 text-left text-sm font-bold text-red-700 hover:bg-red-50 rounded-b-2xl">
                      Revoke role
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Audit
            </p>
            <h2 className="mt-1 text-2xl font-bold">Role Change History</h2>
          </div>
          <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
            Export Log
          </button>
        </div>

        <div className="space-y-2">
          {auditLog.map((log) => (
            <div
              className="rounded-[2rem] border border-slate-100 hover:border-rose-200 hover:bg-rose-50 transition p-5 flex items-start gap-4"
              key={log.id}
            >
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 shrink-0">
                {log.action.includes("Promoted") || log.action.includes("Admin") ? (
                  <ArrowUp className="h-5 w-5 text-blue-600" />
                ) : log.action.includes("revoked") ? (
                  <Trash2 className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-slate-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900">{log.action}</p>
                <div className="mt-1 grid gap-1 text-xs text-slate-500">
                  <p>User: {log.user}</p>
                  <p>By: {log.by}</p>
                  <p>
                    {log.date} at {log.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border border-blue-200 bg-blue-50">
        <div className="flex items-start gap-4">
          <Shield className="h-6 w-6 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-900">Role Permissions</p>
            <p className="mt-2 text-sm text-blue-800">
              <strong>Super Admin:</strong> Full platform access, manage admins
              and moderators
            </p>
            <p className="mt-2 text-sm text-blue-800">
              <strong>Admin:</strong> Manage users, vets, payments, and settings
            </p>
            <p className="mt-2 text-sm text-blue-800">
              <strong>Moderator:</strong> Verify vets, flag content, support
              tickets
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}
