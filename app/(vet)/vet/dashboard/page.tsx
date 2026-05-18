import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

import { dbConnect } from "@/lib/db/connect";
import { VetProfile } from "@/lib/db/models/VetProfile";
import { Consultation } from "@/lib/db/models/Consultation";
import { Review } from "@/lib/db/models/Review";
import { User } from "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "Vet Dashboard | pawwcure",
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
  await dbConnect();

  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get current vet user from auth context
  // For now, we'll fetch the first vet to demonstrate
  const vetUser = await User.findOne({ role: "vet" });
  
  if (!vetUser) {
    return (
      <section className="space-y-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-red-900 font-bold">No vet profile found</p>
        </div>
      </section>
    );
  }

  const vetProfile = await VetProfile.findOne({ userId: vetUser._id });

  const [
    todayConsultations,
    totalEarnings,
    pendingRecords,
    averageRating,
    consultations,
    recentReviews,
  ] = await Promise.all([
    Consultation.countDocuments({
      vetId: vetUser._id,
      scheduledAt: { $gte: today, $lt: tomorrow },
    }),
    Consultation.aggregate([
      {
        $match: {
          vetId: vetUser._id,
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$fees.total" },
        },
      },
    ]),
    Consultation.countDocuments({
      vetId: vetUser._id,
      status: { $in: ["completed", "ongoing"] },
    }),
    Review.aggregate([
      {
        $match: {
          vetId: vetUser._id,
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$rating" },
        },
      },
    ]),
    Consultation.find({
      vetId: vetUser._id,
    })
      .sort({ scheduledAt: -1 })
      .limit(5),
    Review.find({
      vetId: vetUser._id,
    })
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const earnings = totalEarnings[0]?.total || 0;
  const rating = averageRating[0]?.avg?.toFixed(1) || "0";
  const upcomingCount = consultations.filter(
    (c: any) => c.scheduledAt > now && c.status === "scheduled"
  ).length;

  const stats = [
    {
      icon: DollarSign,
      label: "Today's Earnings",
      tone: "bg-emerald-50 text-emerald-700",
      value: formatBDT(earnings),
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
      value: `${rating}★`,
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
              Hi {vetUser.name.split(" ")[0]}, you have {upcomingCount} sessions
              today.
            </h1>
            <p className="mt-5 max-w-xl leading-relaxed text-teal-100/70">
              Review your schedule, pending patient notes, recent reviews, and
              earnings from one dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex justify-center rounded-2xl bg-white px-6 py-4 text-sm font-bold text-teal-950 shadow-xl shadow-black/10 transition hover:scale-[1.02] active:scale-95"
                href="/vet/consultations"
              >
                View Schedule
              </Link>
              <Link
                className="inline-flex justify-center rounded-2xl border border-white/15 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10"
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
                  {vetProfile?.clinicName || "Not set"}
                </p>
              </div>
              <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-100/70">
                  Phone
                </p>
                <p className="mt-1 text-xl font-bold">
                  {vetProfile?.phoneNumber || "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {stats.map(({ icon: Icon, label, tone, value }, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
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
          <div className="flex items-center justify-between gap-4 mb-5">
            <h3 className="text-lg font-bold text-slate-900">
              Upcoming Sessions
            </h3>
          </div>
          <div className="space-y-4">
            {consultations.slice(0, 5).map((consultation: any) => (
              <div
                key={consultation._id}
                className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {consultation.type}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(consultation.scheduledAt).toLocaleString()}
                  </p>
                </div>
                <div
                  className={`text-sm font-bold px-3 py-1 rounded-full ${
                    consultation.status === "scheduled"
                      ? "bg-blue-100 text-blue-700"
                      : consultation.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {consultation.status}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4 mb-5">
            <h3 className="text-lg font-bold text-slate-900">
              Recent Reviews
            </h3>
          </div>
          <div className="space-y-4">
            {recentReviews.slice(0, 5).map((review: any) => (
              <div
                key={review._id}
                className="border-b border-slate-100 pb-4 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">★</span>
                  <span className="font-bold text-slate-900">{review.rating}</span>
                  <span className="text-sm text-slate-500">({review.title})</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">{review.comment}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
