import type { Metadata } from "next";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  RefreshCcw,
  Send,
} from "lucide-react";

import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import "@/lib/db/models/Pet";
import "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "Payments & Payouts | pawwcure Admin",
};

type PaymentStatus = "completed" | "failed" | "pending" | "refunded";

type ConsultationPayment = {
  _id: { toString(): string };
  createdAt: Date;
  fees: {
    total: number;
  };
  paymentStatus: PaymentStatus;
  petId?: {
    name?: string;
  };
  scheduledAt: Date;
  transactionId?: string;
  userId?: {
    email?: string;
    name?: string;
  };
  vetId?: {
    email?: string;
    name?: string;
  };
};

type VetPayoutRow = {
  _id: string;
  consultations: number;
  gross: number;
  vet?: {
    email?: string;
    name?: string;
  };
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

function money(value: number) {
  return `BDT ${new Intl.NumberFormat("en-BD").format(Math.round(value))}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function statusClass(status: PaymentStatus) {
  if (status === "completed") return "bg-emerald-50 text-emerald-700";
  if (status === "failed") return "bg-red-50 text-red-700";
  if (status === "refunded") return "bg-slate-100 text-slate-600";
  return "bg-amber-50 text-amber-700";
}

function statusIcon(status: PaymentStatus) {
  if (status === "completed") return CheckCircle2;
  if (status === "failed") return AlertCircle;
  if (status === "refunded") return RefreshCcw;
  return Clock;
}

export default async function AdminPaymentsPage() {
  await dbConnect();

  const monthStart = startOfMonth(new Date());

  const [statusTotals, payoutRows, recentTransactions] = await Promise.all([
    Consultation.aggregate<{ _id: PaymentStatus; count: number; total: number }>([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          total: { $sum: "$fees.total" },
        },
      },
    ]),
    Consultation.aggregate<VetPayoutRow>([
      {
        $match: {
          createdAt: { $gte: monthStart },
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: "$vetId",
          consultations: { $sum: 1 },
          gross: { $sum: "$fees.total" },
        },
      },
      { $sort: { gross: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          as: "vet",
          foreignField: "_id",
          from: "users",
          localField: "_id",
        },
      },
      { $unwind: { path: "$vet", preserveNullAndEmptyArrays: true } },
      { $project: { consultations: 1, gross: 1, "vet.name": 1, "vet.email": 1 } },
    ]),
    Consultation.find({})
      .select("fees paymentStatus transactionId scheduledAt createdAt")
      .populate("userId", "name email")
      .populate("vetId", "name email")
      .populate("petId", "name")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const totals = new Map(statusTotals.map((row) => [row._id, row]));
  const completedTotal = totals.get("completed")?.total ?? 0;
  const pendingTotal = totals.get("pending")?.total ?? 0;
  const failedCount = totals.get("failed")?.count ?? 0;
  const platformFee = completedTotal * 0.12;
  const payoutTotal = completedTotal - platformFee;

  return (
    <section className="space-y-8">
      <div>
        <div className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
          Payments & Payouts
        </div>
        <h1 className="text-4xl font-bold">Revenue Management</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Internal demo ledger from consultation records. No payment gateway is
          connected here; SSLCommerz can be added later without changing this
          admin overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          icon={DollarSign}
          label="Completed Revenue"
          tone="emerald"
          value={money(completedTotal)}
        />
        <Stat
          icon={Clock}
          label="Pending Payments"
          tone="blue"
          value={money(pendingTotal)}
        />
        <Stat
          icon={Send}
          label="Vet Payout Pool"
          tone="purple"
          value={money(payoutTotal)}
        />
        <Stat
          icon={CreditCard}
          label="Platform Fee"
          tone="amber"
          value={money(platformFee)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <div className="border-b border-slate-100 bg-slate-50 p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Payout Queue
            </p>
            <h2 className="mt-1 text-lg font-bold">Monthly Vet Payouts</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {payoutRows.length === 0 ? (
              <Empty label="No completed consultation revenue this month." />
            ) : (
              payoutRows.map((payout) => {
                const platformShare = payout.gross * 0.12;
                const vetShare = payout.gross - platformShare;

                return (
                  <div
                    className="grid gap-4 p-5 transition hover:bg-slate-50 md:grid-cols-[1fr_150px_150px]"
                    key={payout._id}
                  >
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-slate-900">
                        {payout.vet?.name ?? "Unassigned vet"}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {payout.consultations} completed consultations
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Vet payout
                      </p>
                      <p className="mt-1 font-bold text-slate-900">
                        {money(vetShare)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Platform fee
                      </p>
                      <p className="mt-1 font-bold text-rose-700">
                        {money(platformShare)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card>
          <p className="mb-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Ledger Summary
          </p>
          <div className="space-y-3">
            <Summary label="Completed" value={totals.get("completed")?.count ?? 0} />
            <Summary label="Pending" value={totals.get("pending")?.count ?? 0} />
            <Summary label="Refunded" value={totals.get("refunded")?.count ?? 0} />
            <Summary label="Failed" value={failedCount} />
          </div>

          <div className="mt-6 rounded-[2rem] border border-amber-100 bg-amber-50 p-5">
            <p className="font-bold text-amber-900">Gateway status</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-800">
              Payments are represented by consultation records only. No Stripe
              code is used, and no SSLCommerz code has been added yet.
            </p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-slate-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Recent Transactions
          </p>
          <h2 className="mt-1 text-lg font-bold">Consultation Payment Ledger</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {(recentTransactions as unknown as ConsultationPayment[]).length ===
          0 ? (
            <Empty label="No consultation payments recorded yet." />
          ) : (
            (recentTransactions as unknown as ConsultationPayment[]).map((tx) => {
              const Icon = statusIcon(tx.paymentStatus);

              return (
                <div
                  className="grid gap-4 p-5 transition hover:bg-slate-50 lg:grid-cols-[1fr_160px_140px_130px]"
                  key={tx._id.toString()}
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">
                      {tx.userId?.name ?? "Unknown user"} to{" "}
                      {tx.vetId?.name ?? "Unknown vet"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {tx.petId?.name ?? "Pet"} consultation
                      {tx.transactionId ? ` / ${tx.transactionId}` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Amount
                    </p>
                    <p className="mt-1 font-bold text-slate-900">
                      {money(tx.fees.total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Date
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {new Intl.DateTimeFormat("en-US", {
                        day: "numeric",
                        month: "short",
                      }).format(tx.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(
                      tx.paymentStatus
                    )}`}
                  >
                    <Icon className="h-3 w-3" />
                    {tx.paymentStatus}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card className="border border-slate-200 bg-slate-50">
        <div className="flex items-start gap-4">
          <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-slate-600" />
          <div className="flex-1">
            <p className="font-bold text-slate-900">Payment integration note</p>
            <p className="mt-1 text-sm text-slate-600">
              This page intentionally uses app-side demo ledger data from
              consultations. SSLCommerz can be layered in later by writing
              gateway transaction IDs and statuses back to consultations.
            </p>
          </div>
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
  icon: typeof DollarSign;
  label: string;
  tone: "amber" | "blue" | "emerald" | "purple";
  value: string;
}) {
  const tones = {
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    emerald: "bg-emerald-100 text-emerald-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <Card>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold xl:text-3xl">{value}</p>
    </Card>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-[2rem] bg-slate-50 p-4">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <span className="text-lg font-bold text-slate-900">{value}</span>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="p-8 text-center text-sm font-bold text-slate-500">
      {label}
    </div>
  );
}
