import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  LoaderCircle,
  Lock,
  ShieldAlert,
} from "lucide-react";

type RouteStateTone = "dark" | "light";

function stateSurface(tone: RouteStateTone) {
  return tone === "dark"
    ? "bg-slate-950 text-white"
    : "bg-[#FAFAFA] text-slate-950";
}

export function RouteLoading({
  label = "Loading pawwcure",
  tone = "light",
}: {
  label?: string;
  tone?: RouteStateTone;
}) {
  return (
    <div
      className={`flex min-h-[60vh] items-center justify-center px-4 py-16 ${stateSurface(
        tone
      )}`}
    >
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-emerald-50 text-emerald-700">
          <LoaderCircle className="h-7 w-7 animate-spin" />
        </div>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
          Please wait
        </p>
        <h1 className="mt-2 text-2xl font-bold">{label}</h1>
        <div className="mx-auto mt-6 max-w-xs space-y-2">
          <div className="h-3 rounded-full bg-slate-200/80" />
          <div className="mx-auto h-3 w-4/5 rounded-full bg-slate-200/60" />
          <div className="mx-auto h-3 w-3/5 rounded-full bg-slate-200/40" />
        </div>
      </div>
    </div>
  );
}

export function FullPageState({
  actionHref = "/",
  actionLabel = "Back to Home",
  code,
  description,
  secondaryHref,
  secondaryLabel,
  title,
  tone = "light",
  variant = "warning",
}: {
  actionHref?: string;
  actionLabel?: string;
  code?: string;
  description: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  title: string;
  tone?: RouteStateTone;
  variant?: "auth" | "error" | "not-found" | "warning";
}) {
  const Icon =
    variant === "auth"
      ? Lock
      : variant === "not-found"
        ? ShieldAlert
        : AlertTriangle;

  return (
    <main
      className={`flex min-h-screen items-center justify-center px-4 py-16 ${stateSurface(
        tone
      )}`}
    >
      <section className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-emerald-50 text-emerald-700 shadow-sm">
          <Icon className="h-9 w-9" />
        </div>
        {code ? (
          <p className="mt-6 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            {code}
          </p>
        ) : null}
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
          {description}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
            href={actionHref}
          >
            <Home className="h-4 w-4" />
            {actionLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              href={secondaryHref}
            >
              <ArrowLeft className="h-4 w-4" />
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
