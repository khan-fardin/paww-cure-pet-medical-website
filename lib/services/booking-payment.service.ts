import { NextResponse } from "next/server";

import { Booking } from "@/lib/db/models/Booking";
import { Consultation } from "@/lib/db/models/Consultation";
import { Payment } from "@/lib/db/models/Payment";
import { calculatePaymentSplit } from "@/lib/config/fees";
import {
  notifyRoles,
  notifyUser,
} from "@/lib/services/notification.service";
import { getAppUrl, validateSslCommerzTransaction } from "./sslcommerz.service";

type SslCallbackPayload = Record<string, string>;

export async function readSslCallbackPayload(req: Request) {
  const formData = await req.formData();
  const payload: SslCallbackPayload = {};

  for (const [key, value] of formData.entries()) {
    payload[key] = String(value);
  }

  return payload;
}

export async function completeSslPayment(payload: SslCallbackPayload) {
  const tranId = payload.tran_id;

  if (!tranId) {
    return NextResponse.redirect(`${getAppUrl()}/payments?status=missing-tran`);
  }

  const payment = await Payment.findOne({ tranId });

  if (!payment) {
    return NextResponse.redirect(`${getAppUrl()}/payments?status=not-found`);
  }

  const booking = await Booking.findById(payment.bookingId);

  if (!booking) {
    payment.status = "failed";
    payment.rawPayload = payload;
    await payment.save();
    return NextResponse.redirect(`${getAppUrl()}/payments?status=booking-missing`);
  }

  if (payment.status === "paid" && booking.consultationId) {
    return NextResponse.redirect(
      `${getAppUrl()}/consultation/${booking.consultationId.toString()}`
    );
  }

  const callbackStatus = payload.status;
  const validation = await validateSslCommerzTransaction(tranId);
  const amountMatches =
    !payload.amount || Number(payload.amount) === Number(payment.amount);
  const callbackLooksValid =
    callbackStatus === "VALID" || callbackStatus === "VALIDATED";

  if (!validation.isValid || !callbackLooksValid || !amountMatches) {
    payment.status = "failed";
    payment.rawPayload = { ...payload, validation: validation.raw };
    booking.status = "payment_failed";
    await Promise.all([payment.save(), booking.save()]);
    return NextResponse.redirect(
      `${getAppUrl()}/book/${booking.vetProfileId.toString()}?payment=failed`
    );
  }

  const consultation = await Consultation.create({
    fees: {
      consultationFee: booking.amount,
      total: booking.amount,
    },
    isFollowUp: false,
    paymentStatus: "completed",
    petId: booking.petId,
    scheduledAt: booking.scheduledAt,
    status: "scheduled",
    transactionId: tranId,
    type: booking.type,
    userId: booking.userId,
    vetId: booking.vetId,
  });

  const { platformFee, vetPayout } = calculatePaymentSplit(payment.amount);

  payment.status = "paid";
  payment.consultationId = consultation._id;
  payment.gatewayTranId = payload.bank_tran_id;
  payment.platformFee = platformFee;
  payment.vetPayout = vetPayout;
  payment.payoutStatus = "pending";
  payment.rawPayload = { ...payload, validation: validation.raw };
  payment.paidAt = new Date();

  booking.status = "confirmed";
  booking.consultationId = consultation._id;

  await Promise.all([
    payment.save(),
    booking.save(),
    notifyUser({
      body: "A paid consultation has been confirmed and added to your schedule.",
      email: true,
      link: `/vet/consultations/${consultation._id.toString()}`,
      title: "New confirmed booking",
      type: "booking",
      userId: booking.vetId,
    }),
    notifyUser({
      body: `Your BDT ${payment.amount} payment was confirmed. The consultation is ready.`,
      email: true,
      link: `/consultation/${consultation._id.toString()}/waiting`,
      title: "Payment confirmed",
      type: "payment",
      userId: booking.userId,
    }),
    notifyRoles({
      body: `A BDT ${payment.amount} consultation payment was confirmed.`,
      link: "/admin/payments",
      roles: ["admin"],
      title: "Payment received",
      type: "payment",
    }),
  ]);

  return NextResponse.redirect(
    `${getAppUrl()}/consultation/${consultation._id.toString()}`
  );
}

export async function markSslPaymentFailed(
  payload: SslCallbackPayload,
  status: "cancelled" | "failed"
) {
  const tranId = payload.tran_id;

  if (!tranId) {
    return NextResponse.redirect(`${getAppUrl()}/payments?status=${status}`);
  }

  const payment = await Payment.findOne({ tranId });

  if (!payment) {
    return NextResponse.redirect(`${getAppUrl()}/payments?status=${status}`);
  }

  const booking = await Booking.findById(payment.bookingId);

  payment.status = status;
  payment.rawPayload = payload;
  await payment.save();

  await notifyUser({
    body:
      status === "cancelled"
        ? "Your consultation payment was cancelled."
        : "Your consultation payment failed. No consultation was confirmed.",
    link: `/book/${booking?.vetProfileId.toString() ?? ""}`,
    title: status === "cancelled" ? "Payment cancelled" : "Payment failed",
    type: "payment",
    userId: payment.userId,
  });

  if (booking) {
    booking.status = status === "cancelled" ? "cancelled" : "payment_failed";
    await booking.save();
    return NextResponse.redirect(
      `${getAppUrl()}/book/${booking.vetProfileId.toString()}?payment=${status}`
    );
  }

  return NextResponse.redirect(`${getAppUrl()}/payments?status=${status}`);
}
