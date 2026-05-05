import type { Metadata } from "next";
import Link from "next/link";
import {
  Save,
  AlertCircle,
  Toggle2,
  Settings as SettingsIcon,
  Bell,
  Lock,
  Database,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Platform Settings | pawwcure Admin",
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

export default function AdminSettingsPage() {
  return (
    <section className="space-y-8">
      <div>
        <div className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
          Platform Settings
        </div>
        <h1 className="text-4xl font-bold">Configuration</h1>
        <p className="mt-2 text-slate-500">
          Manage platform fees, features, and global settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
              Financial
            </p>
            <h2 className="text-2xl font-bold mb-6">Revenue Settings</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Platform Fee Percentage (%)
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold placeholder-slate-400 outline-none focus:border-rose-300 focus:bg-white transition"
                  defaultValue="12"
                  type="number"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Applied to all vet consultations • Currently: 12%
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Payout Schedule (Days)
                </label>
                <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-300 focus:bg-white transition">
                  <option>Every 7 days</option>
                  <option>Every 14 days</option>
                  <option>Every 30 days</option>
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  Automatic vet payout frequency
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Minimum Payout Amount (BDT)
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold placeholder-slate-400 outline-none focus:border-rose-300 focus:bg-white transition"
                  defaultValue="5000"
                  type="number"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Minimum balance required for payout processing
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Maximum Consultation Fee (BDT)
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold placeholder-slate-400 outline-none focus:border-rose-300 focus:bg-white transition"
                  defaultValue="2000"
                  type="number"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Upper limit for vet fee setting
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
              Features
            </p>
            <h2 className="text-2xl font-bold mb-6">Feature Flags</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
                <div>
                  <p className="font-bold text-slate-900">Video Consultations</p>
                  <p className="text-xs text-slate-500">
                    Enable video call functionality
                  </p>
                </div>
                <button className="relative inline-flex h-8 w-14 items-center rounded-full bg-emerald-600 transition hover:bg-emerald-700">
                  <span className="absolute left-1 inline-block h-6 w-6 transform rounded-full bg-white transition" />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
                <div>
                  <p className="font-bold text-slate-900">Audio Consultations</p>
                  <p className="text-xs text-slate-500">
                    Enable audio call functionality
                  </p>
                </div>
                <button className="relative inline-flex h-8 w-14 items-center rounded-full bg-emerald-600 transition hover:bg-emerald-700">
                  <span className="absolute left-1 inline-block h-6 w-6 transform rounded-full bg-white transition" />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
                <div>
                  <p className="font-bold text-slate-900">Chat Consultations</p>
                  <p className="text-xs text-slate-500">
                    Enable text chat functionality
                  </p>
                </div>
                <button className="relative inline-flex h-8 w-14 items-center rounded-full bg-emerald-600 transition hover:bg-emerald-700">
                  <span className="absolute left-1 inline-block h-6 w-6 transform rounded-full bg-white transition" />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
                <div>
                  <p className="font-bold text-slate-900">Vet Verification</p>
                  <p className="text-xs text-slate-500">
                    Require license verification for vets
                  </p>
                </div>
                <button className="relative inline-flex h-8 w-14 items-center rounded-full bg-emerald-600 transition hover:bg-emerald-700">
                  <span className="absolute left-1 inline-block h-6 w-6 transform rounded-full bg-white transition" />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
                <div>
                  <p className="font-bold text-slate-900">Maintenance Mode</p>
                  <p className="text-xs text-slate-500">
                    Hide platform from public, show message
                  </p>
                </div>
                <button className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-300 transition hover:bg-slate-400">
                  <span className="absolute right-1 inline-block h-6 w-6 transform rounded-full bg-white transition" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-rose-700">
              <Save className="h-4 w-4" />
              Save Settings
            </button>
          </Card>

          <Card>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
              Platform
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-500">Version</p>
                <p className="text-lg font-bold text-slate-900">2.1.0</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Last Updated</p>
                <p className="text-sm font-bold text-slate-900">May 3, 2026</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Status</p>
                <p className="text-sm font-bold text-emerald-700">Operational</p>
              </div>
            </div>
          </Card>

          <Card className="border border-blue-200 bg-blue-50">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900">Database</p>
                <p className="mt-1 text-xs text-blue-800">
                  Database connection is active and healthy
                </p>
                <button className="mt-2 text-xs font-bold text-blue-700 hover:text-blue-900">
                  View Details →
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
          Allowed Pets
        </p>
        <h2 className="text-2xl font-bold mb-6">Supported Species</h2>

        <div className="grid gap-3 md:grid-cols-4">
          {[
            "Dogs",
            "Cats",
            "Birds",
            "Rabbits",
            "Hamsters",
            "Guinea Pigs",
            "Reptiles",
            "Fish",
          ].map((species) => (
            <label
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 cursor-pointer hover:bg-rose-50 transition"
              key={species}
            >
              <input
                className="h-5 w-5 rounded-lg border-slate-300 text-rose-600 focus:ring-rose-500"
                type="checkbox"
                defaultChecked
              />
              <span className="font-bold text-slate-900">{species}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
          Notifications
        </p>
        <h2 className="text-2xl font-bold mb-6">Email Templates</h2>

        <div className="space-y-3">
          {[
            { name: "New User Welcome", status: "active" },
            { name: "Vet Verification", status: "active" },
            { name: "Consultation Reminder", status: "active" },
            { name: "Weekly Summary", status: "inactive" },
            { name: "Payment Confirmation", status: "active" },
            { name: "Support Ticket Update", status: "active" },
          ].map((template) => (
            <div
              className="flex items-center justify-between rounded-[2rem] border border-slate-100 hover:border-rose-200 hover:bg-rose-50 transition p-5"
              key={template.name}
            >
              <div>
                <p className="font-bold text-slate-900">{template.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    template.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {template.status}
                </span>
                <button className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border border-amber-200 bg-amber-50">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900">
              Dangerous Zone - Admin Only
            </p>
            <p className="mt-2 text-sm text-amber-800">
              These actions cannot be undone. Use with extreme caution.
            </p>
            <div className="mt-4 flex gap-3">
              <button className="rounded-2xl border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50 transition">
                Reset Demo Data
              </button>
              <button className="rounded-2xl border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50 transition">
                Wipe All User Data
              </button>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
