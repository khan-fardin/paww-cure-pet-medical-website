import type { Metadata } from "next";
import Link from "next/link";
import {
  DollarSign,
  Send,
  Search,
  Check,
  Clock,
  AlertCircle,
  CreditCard,
  TrendingUp,
  Download,
  MoreVertical,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Payments & Payouts | pawwcure Admin",
};

const payouts = [
  {
    id: 1,
    vet: "Dr. Amina Parveen",
    amount: "BDT 156,420",
    status: "scheduled",
    dueDate: "May 10, 2026",
    consultations: 342,
  },
  {
    id: 2,
    vet: "Dr. Ryan Mitchell",
    amount: "BDT 108,540",
    status: "pending",
    dueDate: "May 5, 2026",
    consultations: 201,
  },
  {
    id: 3,
    vet: "Dr. Samuel Cross",
    amount: "BDT 58,900",
    status: "processing",
    dueDate: "May 8, 2026",
    consultations: 128,
  },
  {
    id: 4,
    vet: "Dr. Farzana Khan",
    amount: "BDT 42,100",
    status: "scheduled",
    dueDate: "May 12, 2026",
    consultations: 89,
  },
];

const transactions = [
  {
    id: 1,
    type: "Consultation",
    amount: "+ BDT 500",
    from: "Sarah Ahmed",
    date: "May 3, 2026",
    time: "2:34 PM",
  },
  {
    id: 2,
    type: "Platform Fee",
    amount: "- BDT 60",
    from: "System",
    date: "May 3, 2026",
    time: "2:34 PM",
  },
  {
    id: 3,
    type: "Consultation",
    amount: "+ BDT 450",
    from: "Imran Hassan",
    date: "May 2, 2026",
    time: "11:15 AM",
  },
  {
    id: 4,
    type: "Refund",
    amount: "- BDT 500",
    from: "Nadia Islam",
    date: "May 1, 2026",
    time: "9:42 PM",
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

export default function AdminPaymentsPage() {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
            Payments & Payouts
          </div>
          <h1 className="text-4xl font-bold">Revenue Management</h1>
          <p className="mt-2 text-slate-500">
            Overview revenue, process payouts, and manage transactions
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          href="#"
        >
          <Download className="h-4 w-4" />
          Export Report
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Revenue
          </p>
          <p className="mt-1 text-3xl font-bold">BDT 487,200</p>
          <p className="mt-2 text-xs text-emerald-700">+18% vs last month</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Pending Payouts
          </p>
          <p className="mt-1 text-3xl font-bold">BDT 365,960</p>
          <p className="mt-2 text-xs text-blue-700">4 vets awaiting</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
              <Send className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Paid Out
          </p>
          <p className="mt-1 text-3xl font-bold">BDT 842,100</p>
          <p className="mt-2 text-xs text-purple-700">All time total</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Platform Fee
          </p>
          <p className="mt-1 text-3xl font-bold">BDT 58,464</p>
          <p className="mt-2 text-xs text-amber-700">12% of revenue</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Payout Queue
              </p>
              <h2 className="mt-1 text-lg font-bold">Vet Payouts</h2>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {payouts.map((payout) => (
              <div
                className="hover:bg-slate-50 transition p-6 flex items-center justify-between gap-4"
                key={payout.id}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">
                    {payout.vet}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {payout.consultations} consultations
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-900">{payout.amount}</p>
                  <p className="text-xs text-slate-500">
                    Due: {payout.dueDate}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                    payout.status === "scheduled"
                      ? "bg-blue-100 text-blue-700"
                      : payout.status === "processing"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {payout.status}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-50"
                    type="button"
                  >
                    <Check className="h-4 w-4" />
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
                        Process now
                      </button>
                      <button className="block w-full px-4 py-3 text-left text-sm font-bold text-blue-700 hover:bg-blue-50">
                        View details
                      </button>
                      <button className="block w-full px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-b-2xl">
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-5">
            Transaction Search
          </p>
          <div className="space-y-3 mb-6">
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold placeholder-slate-400 outline-none focus:border-rose-300 focus:bg-white transition"
              placeholder="Search transactions..."
              type="text"
            />
            <div className="flex gap-2">
              <button className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-rose-50 transition">
                All
              </button>
              <button className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-rose-50 transition">
                Incoming
              </button>
              <button className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-rose-50 transition">
                Outgoing
              </button>
            </div>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            Recent
          </p>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                className="rounded-[2rem] bg-slate-50 p-4 flex items-center justify-between hover:bg-rose-50 transition"
                key={tx.id}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {tx.type}
                  </p>
                  <p className="text-xs text-slate-500">{tx.from}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${
                      tx.amount.startsWith("+")
                        ? "text-emerald-700"
                        : "text-slate-600"
                    }`}
                  >
                    {tx.amount}
                  </p>
                  <p className="text-xs text-slate-500">{tx.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="border border-amber-200 bg-amber-50">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-amber-900">Stripe Integration</p>
            <p className="mt-1 text-sm text-amber-800">
              Connect your Stripe account to process payouts automatically and
              receive payments from users.
            </p>
            <button className="mt-3 rounded-2xl bg-amber-700 px-4 py-2 text-sm font-bold text-white hover:bg-amber-800 transition">
              Configure Stripe
            </button>
          </div>
        </div>
      </Card>
    </section>
  );
}
