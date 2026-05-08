import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  MoreVertical,
  Shield,
  Lock,
  AlertCircle,
  DollarSign,
  Stethoscope,
  Check,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Vet Management | pawwcure Admin",
};

const vets = [
  {
    id: 1,
    name: "Dr. Amina Parveen",
    email: "amina@veterinary.com",
    specialty: "Emergency Medicine",
    joinDate: "Dec 1, 2025",
    consultations: 342,
    earnings: "BDT 156,420",
    fee: "BDT 500/session",
    status: "verified",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Dr. Samuel Cross",
    email: "samuel@veterinary.com",
    specialty: "Orthopedics",
    joinDate: "Dec 15, 2025",
    consultations: 128,
    earnings: "BDT 58,900",
    fee: "BDT 600/session",
    status: "verified",
    rating: 4.7,
  },
  {
    id: 3,
    name: "Dr. Farzana Khan",
    email: "farzana@veterinary.com",
    specialty: "Dermatology",
    joinDate: "Jan 8, 2026",
    consultations: 89,
    earnings: "BDT 42,100",
    fee: "BDT 450/session",
    status: "pending",
    rating: 4.9,
  },
  {
    id: 4,
    name: "Dr. Ryan Mitchell",
    email: "ryan@veterinary.com",
    specialty: "Cardiology",
    joinDate: "Jan 22, 2026",
    consultations: 201,
    earnings: "BDT 108,540",
    fee: "BDT 550/session",
    status: "verified",
    rating: 4.6,
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

export default function AdminVetsPage() {
  return (
    <section className="space-y-8">
      <div>
        <div className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
          Vet Management
        </div>
        <h1 className="text-4xl font-bold">Veterinarian Accounts</h1>
        <p className="mt-2 text-slate-500">
          Manage vet verification, fees, suspension, and override account settings
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 p-5 flex gap-3">
          <div className="flex-1 flex items-center gap-3 rounded-2xl bg-white px-4 py-2 border border-slate-200">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="flex-1 bg-transparent text-sm font-bold placeholder-slate-400 outline-none"
              placeholder="Search vets by name or email..."
              type="text"
            />
          </div>
          <div className="flex gap-2">
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
              Verified
            </button>
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
              Pending
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {vets.map((vet) => (
            <div
              className="hover:bg-slate-50 transition p-6 flex items-center justify-between gap-4"
              key={vet.id}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 truncate">{vet.name}</h3>
                    <p className="text-xs text-slate-500">{vet.specialty}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      vet.status === "verified"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {vet.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{vet.email}</p>
              </div>

              <div className="grid gap-2 text-center text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Consultations
                  </p>
                  <p className="text-2xl font-bold">{vet.consultations}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Rating
                  </p>
                  <p className="font-bold text-slate-900">⭐ {vet.rating}</p>
                </div>
              </div>

              <div className="grid gap-2 text-right text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Fee
                  </p>
                  <p className="font-bold text-slate-900">{vet.fee}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Earnings
                  </p>
                  <p className="font-bold text-emerald-700">{vet.earnings}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  title="Override verification"
                  type="button"
                >
                  <Shield className="h-4 w-4" />
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  title="Edit fees"
                  type="button"
                >
                  <DollarSign className="h-4 w-4" />
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
                      View profile
                    </button>
                    <button className="block w-full px-4 py-3 text-left text-sm font-bold text-blue-700 hover:bg-blue-50">
                      View earnings
                    </button>
                    <button className="block w-full px-4 py-3 text-left text-sm font-bold text-amber-700 hover:bg-amber-50">
                      Suspend temporarily
                    </button>
                    <button className="block w-full px-4 py-3 text-left text-sm font-bold text-red-700 hover:bg-red-50 rounded-b-2xl">
                      Revoke verification
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
            <h2 className="mt-1 text-2xl font-bold">Vet Overview</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[2rem] bg-linear-to-br from-emerald-50 to-emerald-100 p-5 border border-emerald-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Total Vets
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-900">94</p>
            <p className="mt-1 text-xs text-emerald-700/70">+8 pending</p>
          </div>

          <div className="rounded-[2rem] bg-linear-to-br from-blue-50 to-blue-100 p-5 border border-blue-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Verified
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-900">86</p>
            <p className="mt-1 text-xs text-blue-700/70">91.5% of vets</p>
          </div>

          <div className="rounded-[2rem] bg-linear-to-br from-amber-50 to-amber-100 p-5 border border-amber-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
              Pending Review
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-900">8</p>
            <p className="mt-1 text-xs text-amber-700/70">Awaiting approval</p>
          </div>

          <div className="rounded-[2rem] bg-linear-to-br from-red-50 to-red-100 p-5 border border-red-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">
              Suspended
            </p>
            <p className="mt-2 text-3xl font-bold text-red-900">0</p>
            <p className="mt-1 text-xs text-red-700/70">Currently active</p>
          </div>
        </div>
      </Card>
    </section>
  );
}
