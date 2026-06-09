import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  Clock,
  Flag,
  Stethoscope,
} from "lucide-react";

import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { VetProfile } from "@/lib/db/models/VetProfile";
import { Review } from "@/lib/db/models/Review";

export const metadata: Metadata = {
  title: "Moderator Dashboard | pawwcure",
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

export default async function ModDashboardPage() {
  await dbConnect();

  const [
    pendingVets,
    verificationCount,
    flaggedReviews,
    activeConsultations,
    attentionConsultations,
    pendingVetsList,
    flaggedReviewsList,
  ] = await Promise.all([
    VetProfile.countDocuments({ applicationStatus: "submitted" }),
    VetProfile.countDocuments({ applicationStatus: "submitted" }),
    Review.countDocuments({ isVisible: false }),
    Consultation.countDocuments({
      status: { $in: ["scheduled", "ongoing"] },
      paymentStatus: "completed",
    }),
    Consultation.countDocuments({
      status: "scheduled",
      paymentStatus: "completed",
      scheduledAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) },
    }),
    VetProfile.find({ applicationStatus: "submitted" })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(5),
    Review.find({ isVisible: false })
      .populate("vetId", "clinicName")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const totalPending = verificationCount + flaggedReviews + attentionConsultations;

  const stats = [
    {
      icon: Clock,
      label: "Pending Verifications",
      tone: "bg-amber-50 text-amber-700",
      value: verificationCount.toString(),
    },
    {
      icon: Flag,
      label: "Flagged Reviews",
      tone: "bg-red-50 text-red-600",
      value: flaggedReviews.toString(),
    },
    {
      icon: Stethoscope,
      label: "Live Consults",
      tone: "bg-blue-50 text-blue-600",
      value: activeConsultations.toString(),
    },
    {
      icon: AlertCircle,
      label: "Needs Help",
      tone: "bg-red-50 text-red-600",
      value: attentionConsultations.toString(),
    },
  ] as const;

  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-amber-950 p-6 text-white sm:p-8 md:rounded-[3rem] md:p-10">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-100">
              Moderator Dashboard
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Welcome back, you have {totalPending} pending items.
            </h1>
            <p className="mt-5 max-w-xl leading-relaxed text-amber-100/70">
              Review vet applications, flagged content, and support tickets to
              keep the platform safe and trustworthy.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex justify-center rounded-2xl bg-white px-6 py-4 text-sm font-bold text-amber-950 shadow-xl shadow-black/10 transition hover:scale-[1.02] active:scale-95"
                href="/mod/vets"
              >
                Review Vets
              </Link>
              <Link
                className="inline-flex justify-center rounded-2xl border border-white/15 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                href="/mod/consultations"
              >
                Watch Consults
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-100/70">
                  Pending verifications
                </p>
                <p className="mt-1 text-xl font-bold">{verificationCount}</p>
              </div>
              <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-100/70">
                  Flagged reviews
                </p>
                <p className="mt-1 text-xl font-bold">{flaggedReviews}</p>
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
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900">
              Consultation Operations
            </h3>
            <Link
              href="/mod/consultations"
              className="text-sm font-bold text-amber-600 hover:text-amber-700"
            >
              Monitor all
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-blue-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Active paid sessions
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-950">
                {activeConsultations}
              </p>
            </div>
            <div className="rounded-2xl bg-red-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                Late scheduled
              </p>
              <p className="mt-2 text-3xl font-bold text-red-950">
                {attentionConsultations}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4 mb-5">
            <h3 className="text-lg font-bold text-slate-900">
              Pending Vet Applications
            </h3>
            <Link
              href="/mod/vets"
              className="text-sm font-bold text-amber-600 hover:text-amber-700"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {pendingVetsList.length > 0 ? (
              pendingVetsList.map((vet: any) => (
                <div
                  key={vet._id}
                  className="border-b border-slate-100 pb-4 last:border-0"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {(vet.userId as any)?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-slate-500">{vet.clinicName}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Applied:{" "}
                        {new Date(vet.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold px-3 py-1 rounded-full ${
                        vet.applicationStatus === "submitted"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {vet.applicationStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No pending applications</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4 mb-5">
            <h3 className="text-lg font-bold text-slate-900">
              Flagged Reviews
            </h3>
            <Link
              href="/mod/flags"
              className="text-sm font-bold text-red-600 hover:text-red-700"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {flaggedReviewsList.length > 0 ? (
              flaggedReviewsList.map((review: any) => (
                <div
                  key={review._id}
                  className="border-b border-slate-100 pb-4 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <Flag className="h-4 w-4 text-red-600 shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-slate-900">
                        {review.title}
                      </p>
                      <p className="text-sm text-slate-600">{review.comment}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        Vet: {(review.vetId as any)?.clinicName || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No flagged reviews</p>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
