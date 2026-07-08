import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { BadgeCheck, MessageCircle, Star } from "lucide-react";

import { PublicReviewActions } from "@/components/public/PublicReviewActions";
import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Review } from "@/lib/db/models/Review";
import "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";

type VetProfilePageProps = {
  params: Promise<{ vetId: string }>;
};

type PublicVetProfile = {
  _id: { toString(): string };
  availability?: { day: string; startTime: string; endTime: string }[];
  averageRating: number;
  bio?: string;
  clinicCity: string;
  clinicName: string;
  consultationDuration: number;
  consultationFee: number;
  experience: number;
  languages: string[];
  servicesOffered: string[];
  specializations: string[];
  totalReviews: number;
  userId?: {
    _id?: { toString(): string };
    avatar?: string;
    name?: string;
  };
};

type PublicReview = {
  _id: { toString(): string };
  comment: string;
  communication?: number;
  createdAt: Date;
  helpful: number;
  helpfulBy?: { toString(): string }[];
  professionalism?: number;
  punctuality?: number;
  rating: number;
  response?: { vetResponse?: string };
  title: string;
  userId?: { avatar?: string; name?: string };
};

async function getVetProfile(vetId: string) {
  if (!mongoose.Types.ObjectId.isValid(vetId)) return null;

  await dbConnect();

  return (await VetProfile.findOne({
    _id: vetId,
    acceptingNewPatients: true,
    isActive: true,
    isVerified: true,
  })
    .populate("userId", "name avatar")
    .lean()) as unknown as PublicVetProfile | null;
}

export async function generateMetadata({
  params,
}: VetProfilePageProps): Promise<Metadata> {
  const { vetId } = await params;
  const vet = await getVetProfile(vetId);

  return {
    title: vet?.userId?.name ? `${vet.userId.name} | pawwcure` : "Vet profile | pawwcure",
  };
}

export default async function VetProfilePage({ params }: VetProfilePageProps) {
  const { vetId } = await params;
  const [vet, session] = await Promise.all([getVetProfile(vetId), getSession()]);

  if (!vet) {
    notFound();
  }

  const name = vet.userId?.name ?? "pawwcure vet";
  const avatar = vet.userId?.avatar ?? `https://i.pravatar.cc/420?u=${vet._id}`;
  const firstSlot = vet.availability?.[0];
  const availability = firstSlot
    ? `${firstSlot.day}, ${firstSlot.startTime}-${firstSlot.endTime}`
    : "Availability shared after booking request";
  const reviews = vet.userId?._id
    ? ((await Review.find({
        isVisible: true,
        vetId: vet.userId._id.toString(),
      })
        .populate("userId", "name avatar")
        .sort({ createdAt: -1 })
        .limit(12)
        .lean()) as unknown as PublicReview[])
    : [];

  return (
    <section className="px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <Link
          className="mb-8 inline-flex text-sm font-bold text-emerald-600 hover:text-emerald-700"
          href="/vets"
        >
          Back to vets
        </Link>

        <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-100 sm:rounded-[3rem] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[360px] bg-emerald-50 sm:min-h-[520px]">
            <Image
              alt={name}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              src={avatar}
            />
            <div className="absolute bottom-5 left-5 right-5 rounded-[2rem] bg-white/85 p-5 shadow-sm backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-8 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Next available
              </p>
              <p className="mt-1 text-xl font-bold sm:text-2xl">
                {availability}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-12">
            <div className="mb-5 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Verified pawwcure vet
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
              {name}
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-slate-500">
              {vet.bio ||
                `${name} offers remote pet care through pawwcure with a verified clinical profile.`}
            </p>

            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Rating", `${vet.averageRating || 0} (${vet.totalReviews})`],
                ["Experience", `${vet.experience} years`],
                ["Fee", `BDT ${vet.consultationFee}`],
              ].map(([label, value]) => (
                <div
                  className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5"
                  key={label}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {label}
                  </p>
                  <p className="mt-2 text-lg font-bold">{value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
                  Specialties
                </h2>
                <div className="flex flex-wrap gap-2">
                  {vet.specializations.map((specialty) => (
                    <span
                      className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700"
                      key={specialty}
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">
                    Clinic
                  </h2>
                  <p className="leading-relaxed text-slate-600">
                    {vet.clinicName}, {vet.clinicCity}
                  </p>
                </div>
                <div>
                  <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">
                    Languages
                  </h2>
                  <p className="leading-relaxed text-slate-600">
                    {vet.languages.length ? vet.languages.join(", ") : "English"}
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] bg-emerald-950 p-6 text-white">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">
                  Consultation
                </p>
                <p className="mt-2 text-xl font-bold">
                  {vet.consultationDuration} minute session
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex flex-1 justify-center rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-600/25 transition hover:scale-[1.02] active:scale-95"
                href={`/book/${vet._id}`}
              >
                Book Consultation
              </Link>
              <Link
                className="inline-flex flex-1 justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition hover:bg-emerald-50"
                href="/vets"
              >
                Compare Vets
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:rounded-[3rem] sm:p-8">
          <div className="grid gap-6 border-b border-slate-100 pb-7 lg:grid-cols-[260px_1fr]">
            <div className="rounded-[2rem] bg-emerald-950 p-6 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">
                Verified rating
              </p>
              <div className="mt-3 flex items-end gap-2">
                <p className="text-5xl font-bold">{vet.averageRating || "0.0"}</p>
                <p className="pb-1 text-sm text-emerald-100/70">out of 5</p>
              </div>
              <div className="mt-3 flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    className={`h-4 w-4 ${
                      index < Math.round(vet.averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-white/20"
                    }`}
                    key={index}
                  />
                ))}
              </div>
              <p className="mt-3 text-sm text-emerald-100/70">
                {reviews.length} published verified review
                {reviews.length === 1 ? "" : "s"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Consultation feedback
              </p>
              <h2 className="mt-2 text-3xl font-bold">What Pet Users Say</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
                Every published review is connected to a completed pawwcure
                consultation. Helpful votes and reports are monitored.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <ReviewMetric
                  label="Communication"
                  value={averageScore(reviews, "communication")}
                />
                <ReviewMetric
                  label="Professional"
                  value={averageScore(reviews, "professionalism")}
                />
                <ReviewMetric
                  label="Punctuality"
                  value={averageScore(reviews, "punctuality")}
                />
              </div>
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {reviews.map((review) => (
                <article
                  className="flex flex-col rounded-[2rem] border border-slate-100 bg-[#FAFAFA] p-5 sm:p-6"
                  key={review._id.toString()}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Image
                        alt={review.userId?.name ?? "Verified user"}
                        className="h-11 w-11 rounded-full object-cover"
                        height={44}
                        src={
                          review.userId?.avatar ??
                          `https://i.pravatar.cc/88?u=${review._id.toString()}`
                        }
                        width={44}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">
                          {review.userId?.name ?? "Verified user"}
                        </p>
                        <p className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Verified consultation
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 shadow-sm">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold">{review.rating}.0</span>
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{review.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 sm:text-base">
                    {review.comment}
                  </p>
                  <p className="mt-4 text-xs font-bold text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>

                  {review.response?.vetResponse ? (
                    <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        <MessageCircle className="h-3.5 w-3.5" />
                        Response from {name}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-emerald-900">
                        {review.response.vetResponse}
                      </p>
                    </div>
                  ) : null}
                  <PublicReviewActions
                    helpful={review.helpful ?? 0}
                    initiallyHelpful={Boolean(
                      session &&
                        review.helpfulBy?.some(
                          (userId) => userId.toString() === session.userId
                        )
                    )}
                    reviewId={review._id.toString()}
                  />
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-8 text-center">
              <p className="font-bold text-slate-700">No reviews yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Verified consultation feedback will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function averageScore(
  reviews: PublicReview[],
  key: "communication" | "professionalism" | "punctuality"
) {
  const values = reviews
    .map((review) => review[key])
    .filter((value): value is number => typeof value === "number");
  if (values.length === 0) return "0.0";
  return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(
    1
  );
}

function ReviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 p-3 text-center sm:p-4">
      <p className="truncate text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
