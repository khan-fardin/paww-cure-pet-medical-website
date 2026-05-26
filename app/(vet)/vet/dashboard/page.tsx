import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, DollarSign, FileText, MessageSquare } from "lucide-react";
import mongoose from "mongoose";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import "@/lib/db/models/Pet";
import { Review } from "@/lib/db/models/Review";
import "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";

export const metadata: Metadata = {
  title: "Vet Dashboard | pawwcure",
};

type ConsultationRow = {
  _id: { toString(): string };
  petId?: { name?: string };
  scheduledAt: Date;
  status: "scheduled" | "ongoing" | "completed" | "cancelled" | "no-show";
  type: string;
};

type ReviewRow = {
  _id: { toString(): string };
  comment: string;
  rating: number;
  title: string;
  userId?: { name?: string };
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

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export default async function VetDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?returnUrl=/vet/dashboard");
  }

  if (session.role !== "vet") {
    redirect("/dashboard");
  }

  await dbConnect();

  const now = new Date();
  const vetObjectId = new mongoose.Types.ObjectId(session.userId);
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    vetProfile,
    todaySessions,
    monthEarnings,
    totalEarnings,
    pendingRecords,
    averageRating,
    consultations,
    recentReviews,
  ] = await Promise.all([
    VetProfile.findOne({ userId: session.userId }).lean<{
      clinicName?: string;
      phoneNumber?: string;
    }>(),
    Consultation.countDocuments({
      scheduledAt: { $gte: today, $lt: tomorrow },
      vetId: session.userId,
    }),
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
    Consultation.countDocuments({
      diagnosis: { $in: [null, ""] },
      paymentStatus: "completed",
      status: { $in: ["ongoing", "completed"] },
      vetId: session.userId,
    }),
    Review.aggregate<{ avg: number }>([
      { $match: { vetId: vetObjectId, isVisible: true } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]),
    Consultation.find({ vetId: session.userId })
      .populate("petId", "name")
      .sort({ scheduledAt: -1 })
      .limit(6)
      .lean<ConsultationRow[]>(),
    Review.find({ vetId: session.userId, isVisible: true })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean<ReviewRow[]>(),
  ]);

  const rating = averageRating[0]?.avg?.toFixed(1) ?? "0.0";
  const upcomingCount = await Consultation.countDocuments({
    scheduledAt: { $gte: now },
    status: { $in: ["scheduled", "ongoing"] },
    vetId: session.userId,
  });

  const stats = [
    {
      icon: DollarSign,
      label: "This Month",
      tone: "bg-emerald-50 text-emerald-700",
      value: formatBDT(monthEarnings[0]?.total ?? 0),
    },
    {
      icon: Clock,
      label: "Upcoming Sessions",
      tone: "bg-blue-50 text-blue-600",
      value: upcomingCount.toString(),
    },
    {
      icon: FileText,
      label: "Pending Records",
      tone: "bg-amber-50 text-amber-700",
      value: pendingRecords.toString(),
    },
    {
      icon: MessageSquare,
      label: "Reviews",
      tone: "bg-teal-50 text-teal-700",
      value: `${rating} star`,
    },
  ] as const;

  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-teal-950 p-6 text-white sm:p-8 md:rounded-[3rem] md:p-10">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-100">
              Vet dashboard
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              You have {todaySessions} sessions today.
            </h1>
            <p className="mt-5 max-w-xl leading-relaxed text-teal-100/70">
              Your schedule, patient notes, reviews, and earnings are scoped to
              your own vet account only.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex justify-center rounded-2xl bg-white px-6 py-4 text-sm font-bold text-teal-950 shadow-xl shadow-black/10"
                href="/vet/consultations"
              >
                View Schedule
              </Link>
              <Link
                className="inline-flex justify-center rounded-2xl border border-white/15 px-6 py-4 text-sm font-bold text-white"
                href="/vet/availability"
              >
                Set Availability
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-100/70">
                  Clinic
                </p>
                <p className="mt-1 text-xl font-bold">
                  {vetProfile?.clinicName ?? "Not set"}
                </p>
              </div>
              <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-100/70">
                  Total earned
                </p>
                <p className="mt-1 text-xl font-bold">
                  {formatBDT(totalEarnings[0]?.total ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {stats.map(({ icon: Icon, label, tone, value }) => (
            <Card key={label}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {value}
                  </p>
                </div>
                <div className={`rounded-full p-4 ${tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900">
              Latest Sessions
            </h3>
            <Link className="text-sm font-bold text-teal-700" href="/vet/consultations">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {consultations.length === 0 ? (
              <p className="text-sm text-slate-500">No sessions yet.</p>
            ) : (
              consultations.map((consultation) => (
                <Link
                  className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0"
                  href={`/vet/consultations/${consultation._id.toString()}`}
                  key={consultation._id.toString()}
                >
                  <div>
                    <p className="font-semibold capitalize text-slate-900">
                      {consultation.petId?.name ?? "Patient"} · {consultation.type}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(consultation.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                    {consultation.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900">Recent Reviews</h3>
            <Link className="text-sm font-bold text-teal-700" href="/vet/reviews">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentReviews.length === 0 ? (
              <p className="text-sm text-slate-500">No reviews yet.</p>
            ) : (
              recentReviews.map((review) => (
                <div
                  className="border-b border-slate-100 pb-4 last:border-0"
                  key={review._id.toString()}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-500">star</span>
                    <span className="font-bold text-slate-900">{review.rating}</span>
                    <span className="text-sm text-slate-500">{review.title}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {review.userId?.name ?? "User"}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
