import type { Metadata } from "next";
import { AlertCircle, Clock, CreditCard, DollarSign, Send } from "lucide-react";

import { MarkPayoutPaidButton } from "@/components/admin/MarkPayoutPaidButton";
import { dbConnect } from "@/lib/db/connect";
import { Payment } from "@/lib/db/models/Payment";
import "@/lib/db/models/Pet";
import "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "Payments & Payouts | pawwcure Admin",
};

type PayoutRow = {
  _id: string;
  count: number;
  gross: number;
  platformFee: number;
  vet?: {
    email?: string;
    name?: string;
  };
  vetPayout: number;
};

type PaymentRow = {
  _id: { toString(): string };
  amount: number;
  createdAt: Date;
  paidAt?: Date;
  payoutStatus: "pending" | "paid";
  platformFee: number;
  status: "pending" | "paid" | "failed" | "cancelled";
  tranId: string;
  userId?: { email?: string; name?: string };
  vetId?: { email?: string; name?: string };
  vetPayout: number;
};

type TotalRow = {
  _id: string;
  count: number;
  gross: number;
  platformFee: number;
  vetPayout: number;
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

function statusClass(status: PaymentRow["status"]) {
  if (status === "paid") return "bg-emerald-50 text-emerald-700";
  if (status === "failed" || status === "cancelled")
    return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-700";
}

export default async function AdminPaymentsPage() {
  await dbConnect();

  const [totals, payoutRows, recentPayments] = await Promise.all([
    Payment.aggregate<TotalRow>([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: "$payoutStatus",
          count: { $sum: 1 },
          gross: { $sum: "$amount" },
          platformFee: { $sum: "$platformFee" },
          vetPayout: { $sum: "$vetPayout" },
        },
      },
    ]),
    Payment.aggregate<PayoutRow>([
      {
        $match: {
          payoutStatus: "pending",
          status: "paid",
        },
      },
      {
        $group: {
          _id: "$vetId",
          count: { $sum: 1 },
          gross: { $sum: "$amount" },
          platformFee: { $sum: "$platformFee" },
          vetPayout: { $sum: "$vetPayout" },
        },
      },
      { $sort: { vetPayout: -1 } },
      {
        $lookup: {
          as: "vet",
          foreignField: "_id",
          from: "users",
          localField: "_id",
        },
      },
      { $unwind: { path: "$vet", preserveNullAndEmptyArrays: true } },
      { $project: { count: 1, gross: 1, platformFee: 1, vetPayout: 1, "vet.name": 1, "vet.email": 1 } },
    ]),
    Payment.find({})
      .select("amount platformFee vetPayout payoutStatus status tranId paidAt createdAt")
      .populate("userId", "name email")
      .populate("vetId", "name email")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
  ]);

  const totalMap = new Map(totals.map((row) => [row._id, row]));
  const pendingPayout = totalMap.get("pending")?.vetPayout ?? 0;
  const paidPayout = totalMap.get("paid")?.vetPayout ?? 0;
  const completedGross =
    (totalMap.get("pending")?.gross ?? 0) + (totalMap.get("paid")?.gross ?? 0);
  const platformFees =
    (totalMap.get("pending")?.platformFee ?? 0) +
    (totalMap.get("paid")?.platformFee ?? 0);

  return (
    <section className="space-y-8">
      <div>
        <div className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
          Payments & Payouts
        </div>
        <h1 className="text-4xl font-bold">Revenue Management</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Simple MVP payout tracking from real SSLCommerz Payment records.
          Admin pays vets manually, then marks their pending records as paid.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={DollarSign} label="Gross Paid Revenue" value={money(completedGross)} />
        <Stat icon={Send} label="Pending Vet Payouts" value={money(pendingPayout)} />
        <Stat icon={CreditCard} label="Paid Out" value={money(paidPayout)} />
        <Stat icon={Clock} label="Platform Fees" value={money(platformFees)} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-slate-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Manual payout queue
          </p>
          <h2 className="mt-1 text-lg font-bold">Pending Payouts By Vet</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {payoutRows.length === 0 ? (
            <Empty label="No pending vet payouts." />
          ) : (
            payoutRows.map((payout) => (
              <div
                className="grid gap-4 p-5 transition hover:bg-slate-50 lg:grid-cols-[1fr_140px_140px_160px_150px]"
                key={payout._id}
              >
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-slate-900">
                    {payout.vet?.name ?? "Unknown vet"}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {payout.vet?.email ?? "No email"} / {payout.count} paid
                    consultations
                  </p>
                </div>
                <MoneyBlock label="Gross" value={payout.gross} />
                <MoneyBlock label="Platform fee" value={payout.platformFee} />
                <MoneyBlock label="Pay vet" value={payout.vetPayout} strong />
                <MarkPayoutPaidButton vetId={payout._id.toString()} />
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-slate-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Recent payments
          </p>
          <h2 className="mt-1 text-lg font-bold">Payment Ledger</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {(recentPayments as unknown as PaymentRow[]).length === 0 ? (
            <Empty label="No payments recorded yet." />
          ) : (
            (recentPayments as unknown as PaymentRow[]).map((payment) => (
              <div
                className="grid gap-4 p-5 transition hover:bg-slate-50 lg:grid-cols-[1fr_130px_130px_130px_120px]"
                key={payment._id.toString()}
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">
                    {payment.userId?.name ?? "User"} to{" "}
                    {payment.vetId?.name ?? "Vet"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {payment.tranId} /{" "}
                    {new Date(payment.paidAt ?? payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <MoneyBlock label="Gross" value={payment.amount} />
                <MoneyBlock label="Vet payout" value={payment.vetPayout} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Payout
                  </p>
                  <p className="mt-1 text-sm font-bold capitalize text-slate-800">
                    {payment.payoutStatus}
                  </p>
                </div>
                <span
                  className={`inline-flex h-fit w-fit items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(
                    payment.status
                  )}`}
                >
                  {payment.status}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="border border-amber-200 bg-amber-50">
        <div className="flex items-start gap-4">
          <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" />
          <div>
            <p className="font-bold text-amber-950">MVP payout workflow</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-800">
              Send the pending vet payout manually through bKash or bank, then
              click Mark as Paid. This updates all pending paid Payment records
              for that vet to payoutStatus paid.
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
  value,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <Icon className="mb-4 h-8 w-8 text-rose-200" />
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold xl:text-3xl">{value}</p>
    </Card>
  );
}

function MoneyBlock({
  label,
  strong = false,
  value,
}: {
  label: string;
  strong?: boolean;
  value: number;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 font-bold ${
          strong ? "text-emerald-700" : "text-slate-900"
        }`}
      >
        {money(value)}
      </p>
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
