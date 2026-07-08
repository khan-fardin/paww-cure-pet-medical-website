import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreditCard, DollarSign, TrendingUp } from "lucide-react";
import mongoose from "mongoose";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Payment } from "@/lib/db/models/Payment";
import "@/lib/db/models/Pet";
import "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "Earnings | pawwcure",
};

type PaymentRow = {
  _id: { toString(): string };
  amount: number;
  createdAt: Date;
  paidAt?: Date;
  payoutStatus: "pending" | "paid";
  petId?: { name?: string };
  platformFee: number;
  tranId: string;
  vetPayout: number;
};

type TotalRow = {
  _id: "paid" | "pending";
  count: number;
  total: number;
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
  return `BDT ${new Intl.NumberFormat("en-BD").format(Math.round(value))}`;
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
  const vetObjectId = new mongoose.Types.ObjectId(session.userId);

  const [totals, transactions] = await Promise.all([
    Payment.aggregate<TotalRow>([
      {
        $match: {
          status: "paid",
          vetId: vetObjectId,
        },
      },
      {
        $group: {
          _id: "$payoutStatus",
          count: { $sum: 1 },
          total: { $sum: "$vetPayout" },
        },
      },
    ]),
    Payment.find({
      status: "paid",
      vetId: session.userId,
    })
      .populate("petId", "name")
      .sort({ paidAt: -1, createdAt: -1 })
      .limit(40)
      .lean(),
  ]);

  const totalMap = new Map(totals.map((row) => [row._id, row]));
  const pendingBalance = totalMap.get("pending")?.total ?? 0;
  const paidOut = totalMap.get("paid")?.total ?? 0;
  const totalEarned = pendingBalance + paidOut;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Earnings</h1>
        <p className="mt-2 text-slate-500">
          Real payout totals from paid consultations. Admin pays pending
          balances manually and marks them paid.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pending balance
              </p>
              <p className="mt-2 text-3xl font-bold">
                {formatBDT(pendingBalance)}
              </p>
            </div>
            <CreditCard className="h-10 w-10 text-amber-100" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total paid out
              </p>
              <p className="mt-2 text-3xl font-bold">{formatBDT(paidOut)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-teal-100" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Lifetime payout
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
        <h2 className="mb-6 text-2xl font-bold">Consultation Earnings</h2>
        <div className="space-y-3">
          {(transactions as unknown as PaymentRow[]).length === 0 ? (
            <p className="text-sm text-slate-500">
              No paid consultations yet.
            </p>
          ) : (
            (transactions as unknown as PaymentRow[]).map((payment) => (
              <div
                className="grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-[1fr_140px_140px_120px]"
                key={payment._id.toString()}
              >
                <div>
                  <p className="font-bold text-slate-900">
                    {payment.petId?.name ?? "Patient"} consultation
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {payment.tranId} /{" "}
                    {new Date(payment.paidAt ?? payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Amount label="Gross" value={payment.amount} />
                <Amount label="Platform fee" value={payment.platformFee} />
                <div className="text-left md:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Your payout
                  </p>
                  <p className="mt-1 font-bold text-emerald-700">
                    {formatBDT(payment.vetPayout)}
                  </p>
                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {payment.payoutStatus}
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

function Amount({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-bold text-slate-900">{formatBDT(value)}</p>
    </div>
  );
}
