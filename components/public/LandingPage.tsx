import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  CalendarCheck,
  HeartPulse,
  MessageCircle,
  PawPrint,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Video,
  type LucideIcon,
} from "lucide-react";
import { dbConnect } from "@/lib/db/connect";
import { Review as ReviewModel } from "@/lib/db/models/Review";
import "@/lib/db/models/User";

type Review = {
  avatar: string;
  label: string;
  name: string;
  quote: string;
  rating: number;
};

const avatarUsers = ["1", "2", "3"] as const;

function HealthVaultIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-12 w-12 text-emerald-400"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function NutritionIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M9 12h6m-3-3v6m8-3a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="mb-4 flex gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          aria-hidden="true"
          className={`h-4 w-4 fill-current ${
            index < rating ? "text-yellow-400" : "text-slate-200"
          }`}
          key={index}
          viewBox="0 0 20 20"
        >
          <path d="m10 1.5 2.49 5.04 5.56.81-4.03 3.93.95 5.54L10 14.2l-4.97 2.62.95-5.54-4.03-3.93 5.56-.81L10 1.5Z" />
        </svg>
      ))}
    </div>
  );
}
type HeroSignal = {
  icon: LucideIcon;
  label: string;
  tone: string;
  value: string;
};

const heroSignals: HeroSignal[] = [
  {
    icon: HeartPulse,
    label: "Health Score",
    tone: "text-emerald-600",
    value: "98 / 100",
  },
  {
    icon: Pill,
    label: "e-Prescription",
    tone: "text-blue-600",
    value: "Ready in 2 min",
  },
];

function SignalCard({ icon: Icon, label, tone, value }: HeroSignal) {
  return (
    <div className="group/card relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-4 shadow-xl shadow-emerald-950/10 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-2xl sm:first:-rotate-2 sm:last:rotate-2 sm:group-hover:first:rotate-0 sm:group-hover:last:rotate-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 ${tone}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
        <Sparkles
          aria-hidden="true"
          className="h-4 w-4 text-amber-400 opacity-70 transition group-hover/card:rotate-12"
        />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function HeroExperiencePanel() {
  return (
    <div className="relative mx-auto w-full max-w-140 lg:ml-auto">
      <div className="group relative isolate overflow-hidden rounded-[3rem] border border-emerald-100/80 bg-linear-to-br from-emerald-50 via-white to-sky-50 p-4 shadow-[0_34px_90px_rgba(15,118,110,0.18)] transition duration-500 hover:-translate-y-1 sm:p-5">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(16,185,129,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.07)_1px,transparent_1px)] bg-size-[32px_32px] opacity-60" />

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Live care room
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20">
              <Video aria-hidden="true" className="h-3.5 w-3.5" />
              24/7
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.25rem] bg-slate-950 shadow-2xl shadow-slate-950/20">
            <div className="relative h-82.5 sm:h-92.5">
              <Image
                alt="Veterinarian caring for a calm dog during a consultation"
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=1100"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/75 via-slate-950/10 to-transparent" />

              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-md">
                <Stethoscope aria-hidden="true" className="h-4 w-4" />
                Dr. Amelia joined
              </div>

              <div className="absolute right-4 top-4 rounded-[1.25rem] border border-white/20 bg-white/90 p-3 text-slate-950 shadow-xl backdrop-blur">
                <div className="mb-2 flex items-center gap-2">
                  <Activity aria-hidden="true" className="h-4 w-4 text-emerald-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Vitals
                  </span>
                </div>
                <div className="flex items-end gap-1">
                  {[38, 54, 44, 68, 48, 76].map((height, index) => (
                    <span
                      className="w-1.5 rounded-full bg-emerald-500/80 transition-all duration-500 group-hover:bg-emerald-600"
                      key={index}
                      style={{ height }}
                    />
                  ))}
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 rounded-3xl border border-white/20 bg-slate-950/70 p-4 text-white shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-emerald-200">
                      Buddy&apos;s consultation
                    </p>
                    <p className="mt-1 text-lg font-bold">Nutrition follow-up</p>
                  </div>
                  <div className="flex -space-x-2">
                    {avatarUsers.map((userId) => (
                      <Image
                        alt=""
                        className="h-9 w-9 rounded-full border-2 border-white object-cover"
                        height={36}
                        key={userId}
                        src={`https://i.pravatar.cc/100?u=hero-${userId}`}
                        width={36}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-20 -mt-8 grid gap-3 px-2 sm:grid-cols-2">
            {heroSignals.map((signal) => (
              <SignalCard key={signal.label} {...signal} />
            ))}
          </div>

          <div className="mt-4 rounded-4xl border border-white/70 bg-white/90 p-4 shadow-xl shadow-emerald-950/10 backdrop-blur transition duration-300 group-hover:-translate-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
                  <PawPrint aria-hidden="true" className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-950">Care plan updated</p>
                  <p className="text-xs text-slate-500">Vaccines, diet, and reminders synced</p>
                </div>
              </div>
              <div className="hidden items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 sm:flex">
                <CalendarCheck aria-hidden="true" className="h-4 w-4 text-emerald-600" />
                Today
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-emerald-50 p-3">
                <ShieldCheck aria-hidden="true" className="mb-2 h-4 w-4 text-emerald-600" />
                <p className="text-[11px] font-bold text-emerald-950">Secure records</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3">
                <MessageCircle aria-hidden="true" className="mb-2 h-4 w-4 text-blue-600" />
                <p className="text-[11px] font-bold text-blue-950">Vet chat</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3">
                <PawPrint aria-hidden="true" className="mb-2 h-4 w-4 text-amber-600" />
                <p className="text-[11px] font-bold text-amber-950">Pet profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export async function LandingPage() {
  await dbConnect();
  const reviewRows = await ReviewModel.find({ isVisible: true })
    .populate("userId", "name avatar")
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();
  const reviews: Review[] = reviewRows.map((review) => {
    const user = review.userId as unknown as {
      avatar?: string;
      name?: string;
    };
    return {
      avatar:
        user.avatar ??
        `https://i.pravatar.cc/100?u=${review._id.toString()}`,
      label: "Verified consultation",
      name: user.name ?? "pawwcure user",
      quote: review.comment,
      rating: review.rating,
    };
  });

  return (
    <>
      <header className="relative overflow-hidden pb-20 pt-32">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
          <div className="z-10 text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 sm:text-xs">
                24/7 Live Doctors Available
              </span>
            </div>

            <h1 className="mb-8 text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
              World-class care for{" "}
              <span className="text-emerald-600">your best friend.</span>
            </h1>

            <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-slate-500 lg:mx-0">
              Skip the waiting room. Access elite veterinary consultations,
              digital prescriptions, and health tracking in one beautiful
              platform.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                className="rounded-2xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-95"
                href="/register"
              >
                Start Free Consult
              </Link>

              <div className="flex items-center justify-center gap-3 px-6">
                <div className="flex -space-x-3">
                  {avatarUsers.map((userId) => (
                    <Image
                      alt=""
                      className="h-10 w-10 rounded-full border-4 border-white"
                      height={40}
                      key={userId}
                      src={`https://i.pravatar.cc/100?u=${userId}`}
                      width={40}
                    />
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">50k+ Happy Pets</p>
                  <p className="text-[10px] text-slate-400">
                    Trusted by users worldwide
                  </p>
                </div>
              </div>
            </div>
          </div>

          <HeroExperiencePanel />
        </div>
      </header>

      <section className="bg-white py-24" id="care">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              A complete ecosystem for care
            </h2>
            <p className="text-slate-500">
              Scientifically designed to make pet parenting effortless.
            </p>
          </div>

          <div className="grid h-auto gap-6 md:h-150 md:grid-cols-6 md:grid-rows-2">
            <div className="flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-emerald-50 p-10 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:col-span-3 md:row-span-2">
              <div>
                <span className="mb-4 inline-block rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase text-white">
                  Real-time
                </span>
                <h3 className="mb-4 text-3xl font-bold leading-tight text-emerald-950">
                  Instant HD Video
                  <br />
                  Consultations
                </h3>
                <p className="max-w-xs text-emerald-800/60">
                  Chat with licensed vets in 4K resolution. It is like they are
                  in your living room.
                </p>
              </div>
              <div className="relative mt-8 h-48 overflow-hidden rounded-2xl shadow-lg">
                <Image
                  alt="Video consultation interface"
                  className="object-cover"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=500"
                />
              </div>
            </div>

            <div
              className="group flex items-center justify-between rounded-[2.5rem] bg-slate-900 p-10 text-white transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:col-span-3"
              id="vets"
            >
              <div className="max-w-55">
                <h3 className="mb-2 text-2xl font-bold">
                  Smart Health Vault
                </h3>
                <p className="text-sm text-slate-400">
                  All medical records, vaccines, and labs stored securely in
                  the cloud.
                </p>
              </div>
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/10 transition-transform group-hover:rotate-12">
                <HealthVaultIcon />
              </div>
            </div>

            <div className="grid gap-6 md:col-span-3 md:grid-cols-2">
              <div className="rounded-[2.5rem] bg-blue-50 p-8 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <ClockIcon />
                </div>
                <h3 className="text-lg font-bold leading-tight">
                  Fast
                  <br />
                  Support
                </h3>
              </div>

              <div className="rounded-[2.5rem] bg-emerald-50 p-8 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <NutritionIcon />
                </div>
                <h3 className="text-lg font-bold leading-tight">
                  Verified
                  <br />
                  Nutrition
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {reviews.length > 0 ? (
        <section className="bg-slate-50 py-24" id="reviews">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="mb-12 text-center text-3xl font-bold">
              What pet families say
            </h2>
            <div className="flex gap-6 overflow-x-auto px-2 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {reviews.map((review) => (
                <article
                  className="min-w-[320px] rounded-4xl border border-slate-100 bg-white p-8 shadow-sm"
                  key={review.name}
                >
                  <StarRating rating={review.rating} />
                  <p className="mb-8 text-slate-600 italic">
                    &quot;{review.quote}&quot;
                  </p>
                  <div className="flex items-center gap-4">
                    <Image
                      alt={review.name}
                      className="h-12 w-12 rounded-full object-cover"
                      height={48}
                      src={review.avatar}
                      width={48}
                    />
                    <div>
                      <p className="text-sm font-bold">{review.name}</p>
                      <p className="text-xs text-slate-400">{review.label}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-6 py-20" id="pricing">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[3rem] bg-emerald-950 p-12 text-center md:p-20">
          <div className="relative z-10">
            <h2 className="mb-6 text-3xl font-bold text-white md:text-5xl">
              Ready to prioritize
              <br />
              your pet&apos;s health?
            </h2>
            <p className="mb-10 text-lg text-emerald-200/60">
              Join 50,000+ users who trust pawwcure every day.
            </p>
            <div className="flex flex-col justify-center gap-4 md:flex-row">
              <Link
                className="rounded-2xl bg-white px-10 py-4 text-lg font-bold text-emerald-950 transition hover:bg-emerald-50"
                href="/register"
              >
                Create Free Account
              </Link>
              <Link
                className="rounded-2xl border border-white/20 px-10 py-4 text-lg font-bold text-white transition hover:bg-white/10"
                href="/vets"
              >
                Talk to an Expert
              </Link>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-600 opacity-20 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-600 opacity-20 blur-[120px]" />
        </div>
      </section>
    </>
  );
}
