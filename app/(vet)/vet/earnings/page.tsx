import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreditCard, DollarSign, TrendingUp } from "lucide-react";
import mongoose from "mongoose";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import "@/lib/db/models/Pet";
import { User } from "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "Earnings | pawwcure",
};

type TransactionRow = {
  _id: { toString(): string };
  fees: { total: number };
  petId?: { name?: string };
  scheduledAt: Date;
  status: string;
  type: string;
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

function formatBDT(value: number) {
  return `BDT ${new Intl.NumberFormat("en-BD").format(value)}`;
}

export default async function EarningsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?returnUrl=/vet/earnings");
  }

  if (session.role !== "vet") {
    redirect("/dashboard");
  }

  await dbConnect();

  const now = new Date();
  const vetObjectId = new mongoose.Types.ObjectId(session.userId);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [vetUser, monthRows, totalRows, transactions] = await Promise.all([
    User.findById(session.userId).select("name").lean<{ name?: string }>(),
    Consultation.aggregate<{ total: number }>([
      {
        $match: {
          paymentStatus: "completed",
          scheduledAt: { $gte: monthStart },
          vetId: vetObjectId,
        },
      },
      { $group: { _id: null, total: { $sum: "$fees.total" } } },
    ]),
    Consultation.aggregate<{ total: number }>([
      {
        $match: {
          paymentStatus: "completed",
          vetId: vetObjectId,
        },
      },
      { $group: { _id: null, total: { $sum: "$fees.total" } } },
    ]),
    Consultation.find({
      paymentStatus: "completed",
      vetId: session.userId,
    })
      .populate("petId", "name")
      .sort({ scheduledAt: -1 })
      .limit(30)
      .lean<TransactionRow[]>(),
  ]);

  const monthTotal = monthRows[0]?.total ?? 0;
  const totalEarned = totalRows[0]?.total ?? 0;
  const pendingPayout = Math.round(monthTotal * 0.8);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Earnings</h1>
        <p className="mt-2 text-slate-500">
          Revenue from completed paid consultations assigned to you.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                This month
              </p>
              <p className="mt-2 text-3xl font-bold">{formatBDT(monthTotal)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-teal-100" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Estimated payout
              </p>
              <p className="mt-2 text-3xl font-bold">
                {formatBDT(pendingPayout)}
              </p>
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
              <p className="mt-2 text-3xl font-bold">
                {formatBDT(totalEarned)}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-emerald-100" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-6">
          <h2 className="mb-4 text-2xl font-bold">Payout Information</h2>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bank account holder
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
              defaultValue={vetUser?.name ?? ""}
              type="text"
            />
          </div>
        </div>
        <button className="w-full rounded-2xl bg-teal-600 px-6 py-3 font-bold text-white transition hover:bg-teal-700">
          Request Payout
        </button>
      </Card>

      <Card>
        <h2 className="mb-6 text-2xl font-bold">Transaction History</h2>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-500">
              No completed paid consultations yet.
            </p>
          ) : (
            transactions.map((transaction) => (
              <div
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                key={transaction._id.toString()}
              >
                <div>
                  <p className="font-bold capitalize text-slate-900">
                    {transaction.type} consultation -{" "}
                    {transaction.petId?.name ?? "Patient"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(transaction.scheduledAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-700">
                    {formatBDT(transaction.fees.total)}
                  </p>
                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </section>
  );
}
