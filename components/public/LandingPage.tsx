import Image from "next/image";
import Link from "next/link";

type Review = {
  avatar: string;
  label: string;
  name: string;
  quote: string;
};

const avatarUsers = ["1", "2", "3"] as const;

const reviews: Review[] = [
  {
    avatar: "https://i.pravatar.cc/100?u=9",
    label: "Luna's family",
    name: "Jessica Miller",
    quote:
      "The late-night video call saved my cat's life. The vet was calm, professional, and knew exactly what to do.",
  },
  {
    avatar: "https://i.pravatar.cc/100?u=12",
    label: "Buddy's family",
    name: "Mark Thompson",
    quote:
      "Finally, a dashboard that makes sense. I can see all of Buddy's records in one place. Highly recommended.",
  },
  {
    avatar: "https://i.pravatar.cc/100?u=15",
    label: "Veterinary surgeon",
    name: "Dr. Emily Chen",
    quote:
      "The onboarding for vets was so smooth. It is a great way for me to help more animals from my own clinic.",
  },
];

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

function StarRating() {
  return (
    <div className="mb-4 flex gap-1 text-yellow-400">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          aria-hidden="true"
          className="h-4 w-4 fill-current"
          key={index}
          viewBox="0 0 20 20"
        >
          <path d="m10 1.5 2.49 5.04 5.56.81-4.03 3.93.95 5.54L10 14.2l-4.97 2.62.95-5.54-4.03-3.93 5.56-.81L10 1.5Z" />
        </svg>
      ))}
    </div>
  );
}

export function LandingPage() {
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

          <div className="relative">
            <div className="relative z-10 h-[420px] overflow-hidden rounded-[3rem] shadow-2xl sm:h-[500px]">
              <Image
                alt="Modern veterinary clinic"
                className="object-cover"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1000"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-emerald-100 opacity-50 blur-3xl" />
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-blue-100 opacity-50 blur-3xl" />
          </div>
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

          <div className="grid h-auto gap-6 md:h-[600px] md:grid-cols-6 md:grid-rows-2">
            <div className="flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-emerald-50 p-10 transition-all duration-[400ms] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:col-span-3 md:row-span-2">
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
              className="group flex items-center justify-between rounded-[2.5rem] bg-slate-900 p-10 text-white transition-all duration-[400ms] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:col-span-3"
              id="vets"
            >
              <div className="max-w-[220px]">
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
              <div className="rounded-[2.5rem] bg-blue-50 p-8 transition-all duration-[400ms] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <ClockIcon />
                </div>
                <h3 className="text-lg font-bold leading-tight">
                  Fast
                  <br />
                  Support
                </h3>
              </div>

              <div className="rounded-[2.5rem] bg-emerald-50 p-8 transition-all duration-[400ms] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
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

      <section className="bg-slate-50 py-24" id="reviews">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold">
            What pet families say
          </h2>
          <div className="flex gap-6 overflow-x-auto px-2 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {reviews.map((review) => (
              <article
                className="min-w-[320px] rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm"
                key={review.name}
              >
                <StarRating />
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
