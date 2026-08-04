import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  CreditCard,
  ReceiptText,
  XCircle,
} from "lucide-react";
import mongoose from "mongoose";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Payment } from "@/lib/db/models/Payment";
import "@/lib/db/models/Booking";
import "@/lib/db/models/Consultation";
import "@/lib/db/models/Pet";
import "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "Payments | pawwcure",
};

type UserPayment = {
  _id: { toString(): string };
  amount: number;
  bookingId?: {
    _id: { toString(): string };
    scheduledAt?: Date;
    status?: string;
    type?: string;
    vetProfileId?: { toString(): string };
  };
  consultationId?: { _id: { toString(): string }; status?: string };
  createdAt: Date;
  currency: "BDT";
  gateway: "sslcommerz";
  gatewayTranId?: string;
  paidAt?: Date;
  petId?: { name?: string; species?: string };
  status: "pending" | "paid" | "failed" | "cancelled";
  tranId: string;
  vetId?: { email?: string; name?: string };
};

type PaymentTotal = {
  _id: UserPayment["status"];
  count: number;
  total: number;
};

function money(value: number, currency = "BDT") {
  return `${currency} ${new Intl.NumberFormat("en-BD").format(
    Math.round(value)
  )}`;
}

function statusClass(status: UserPayment["status"]) {
  if (status === "paid") return "bg-emerald-50 text-emerald-700";
  if (status === "pending") return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

function statusIcon(status: UserPayment["status"]) {
  if (status === "paid") return CheckCircle2;
  if (status === "pending") return Clock;
  return XCircle;
}

export default async function PaymentsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?returnUrl=/payments");
  }

  if (session.role !== "user") {
    redirect(
      session.role === "vet"
        ? "/vet/dashboard"
        : session.role === "mod"
          ? "/mod/dashboard"
          : "/admin/dashboard"
    );
  }

  await dbConnect();

  const userObjectId = new mongoose.Types.ObjectId(session.userId);

  const [totals, payments] = await Promise.all([
    Payment.aggregate<PaymentTotal>([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total: { $sum: "$amount" },
        },
      },
    ]),
    Payment.find({ userId: session.userId })
      .select(
        "amount bookingId consultationId createdAt currency gateway gatewayTranId paidAt petId status tranId vetId"
      )
      .populate("petId", "name species")
      .populate("vetId", "name email")
      .populate("consultationId", "status")
      .populate("bookingId", "scheduledAt status type vetProfileId")
      .sort({ createdAt: -1 })
      .limit(80)
      .lean(),
  ]);

  const totalMap = new Map(totals.map((row) => [row._id, row]));
  const paidTotal = totalMap.get("paid")?.total ?? 0;
  const pendingTotal = totalMap.get("pending")?.total ?? 0;
  const failedOrCancelled =
    (totalMap.get("failed")?.count ?? 0) +
    (totalMap.get("cancelled")?.count ?? 0);
  const paidCount = totalMap.get("paid")?.count ?? 0;
  const paymentRows = payments as unknown as UserPayment[];
  const latestPaid = paymentRows.find((payment) => payment.status === "paid");

  return (
    <UserPageScaffold
      actionHref="/vets"
      actionLabel="Book Consult"
      description="Track real SSLCommerz payments, confirmed consultations, and previous payment history from your account."
      eyebrow="Billing"
      title="Payments"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          icon={CreditCard}
          label="Paid total"
          value={money(paidTotal)}
        />
        <Stat
          icon={Clock}
          label="Pending payment"
          value={money(pendingTotal)}
        />
        <Stat
          icon={ReceiptText}
          label="Paid invoices"
          value={String(paidCount)}
        />
        <Stat
          icon={AlertCircle}
          label="Failed/cancelled"
          value={String(failedOrCancelled)}
        />
      </div>

      {latestPaid ? (
        <div className="mt-6 rounded-[2.5rem] border border-emerald-100 bg-emerald-50 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Latest confirmed payment
              </p>
              <h2 className="mt-2 text-2xl font-bold text-emerald-950">
                {money(latestPaid.amount, latestPaid.currency)}
              </h2>
              <p className="mt-1 text-sm text-emerald-800">
                {latestPaid.petId?.name ?? "Pet"} with{" "}
                {latestPaid.vetId?.name ?? "Vet"} /{" "}
                {new Date(
                  latestPaid.paidAt ?? latestPaid.createdAt
                ).toLocaleString()}
              </p>
            </div>
            {latestPaid.consultationId?._id ? (
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
                href={`/consultation/${latestPaid.consultationId._id.toString()}/waiting`}
              >
                Open consultation
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Previous payments
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">
            Payment History
          </h2>
        </div>

        {paymentRows.length === 0 ? (
          <div className="p-10 text-center">
            <ReceiptText className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 font-bold text-slate-700">
              No payment records yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Your booking payments will appear here after checkout starts.
            </p>
            <Link
              className="mt-5 inline-flex rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
              href="/vets"
            >
              Find a vet
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paymentRows.map((payment) => (
              <PaymentCard key={payment._id.toString()} payment={payment} />
            ))}
          </div>
        )}
      </div>
    </UserPageScaffold>
  );
}

function PaymentCard({ payment }: { payment: UserPayment }) {
  const StatusIcon = statusIcon(payment.status);
  const paidDate = payment.paidAt ?? payment.createdAt;
  const consultationId = payment.consultationId?._id?.toString();
  const vetProfileId = payment.bookingId?.vetProfileId?.toString();

  return (
    <div className="grid gap-4 p-5 transition hover:bg-slate-50 lg:grid-cols-[1fr_150px_150px_150px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(
              payment.status
            )}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {payment.status}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {payment.gateway}
          </span>
        </div>
        <h3 className="mt-3 truncate font-bold text-slate-950">
          {payment.petId?.name ?? "Pet"} consultation
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {payment.vetId?.name ?? "Vet"} / {payment.vetId?.email ?? "No email"}
        </p>
        <p className="mt-2 break-all text-xs text-slate-400">
          Transaction: {payment.tranId}
          {payment.gatewayTranId ? ` / Gateway: ${payment.gatewayTranId}` : ""}
        </p>
      </div>

      <Info label="Amount" value={money(payment.amount, payment.currency)} />
      <Info
        label="Booked for"
        value={
          payment.bookingId?.scheduledAt
            ? new Date(payment.bookingId.scheduledAt).toLocaleString()
            : "Not scheduled"
        }
      />
      <div className="flex flex-col gap-2 lg:items-end">
        <Info label="Recorded" value={new Date(paidDate).toLocaleDateString()} />
        {payment.status === "paid" && consultationId ? (
          <Link
            className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
            href={`/consultation/${consultationId}/summary`}
          >
            View details
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : vetProfileId ? (
          <Link
            className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
            href={`/book/${vetProfileId}`}
          >
            Try again
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CreditCard;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
      <Icon className="mb-4 h-7 w-7 text-emerald-200" />
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}
