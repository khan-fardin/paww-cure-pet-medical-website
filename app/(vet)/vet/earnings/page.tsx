import type { Metadata } from "next";
import { CreditCard, DollarSign, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Earnings | pawwcure",
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

export default function EarningsPage() {
  const transactions = [
    {
      id: "txn-001",
      date: "May 1, 2026",
      amount: "BDT 1,200",
      description: "Video consultation - Luna",
      status: "Completed",
    },
    {
      id: "txn-002",
      date: "April 28, 2026",
      amount: "BDT 1,450",
      description: "Video consultation - Buddy",
      status: "Completed",
    },
    {
      id: "txn-003",
      date: "April 25, 2026",
      amount: "BDT 1,100",
      description: "Chat consultation - Max",
      status: "Completed",
    },
  ];

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Earnings</h1>
        <p className="mt-2 text-slate-500">
          Revenue, payouts, and transaction history
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                This month
              </p>
              <p className="mt-2 text-3xl font-bold">BDT 96,800</p>
            </div>
            <DollarSign className="h-10 w-10 text-teal-100" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pending payout
              </p>
              <p className="mt-2 text-3xl font-bold">BDT 24,200</p>
            </div>
            <CreditCard className="h-10 w-10 text-amber-100" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total earned
              </p>
              <p className="mt-2 text-3xl font-bold">BDT 287,600</p>
            </div>
            <TrendingUp className="h-10 w-10 text-emerald-100" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Payout Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Bank account holder
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                defaultValue="Dr. Amina Rahman"
                type="text"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Bank name
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                  defaultValue="Dhaka Bank"
                  type="text"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Account number
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                  defaultValue="1234567890"
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>
        <button className="rounded-2xl bg-teal-600 px-6 py-3 font-bold text-white transition hover:bg-teal-700 w-full">
          Request Payout
        </button>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
        <div className="space-y-3">
          {transactions.map((txn) => (
            <div
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-50"
              key={txn.id}
            >
              <div>
                <p className="font-bold text-slate-900">{txn.description}</p>
                <p className="mt-1 text-sm text-slate-500">{txn.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-700">{txn.amount}</p>
                <p className="mt-1 text-xs text-slate-500">{txn.status}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
