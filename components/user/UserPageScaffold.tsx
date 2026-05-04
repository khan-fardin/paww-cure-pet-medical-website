import Link from "next/link";
import type { ReactNode } from "react";

type UserPageScaffoldProps = {
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

export function UserPageScaffold({
  actionHref,
  actionLabel,
  children,
  description,
  eyebrow,
  title,
}: UserPageScaffoldProps) {
  return (
    <section>
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            {eyebrow}
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-slate-500">
            {description}
          </p>
        </div>

        {actionHref && actionLabel ? (
          <Link
            className="inline-flex rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-600/25 transition hover:scale-[1.02] active:scale-95"
            href={actionHref}
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>

      {children ?? (
        <div className="grid gap-6 md:grid-cols-3">
          {["Primary workspace", "Activity", "Next actions"].map((label) => (
            <div
              className="min-h-56 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm"
              key={label}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
              </p>
              <div className="mt-8 space-y-3">
                <div className="h-3 rounded-full bg-slate-100" />
                <div className="h-3 w-4/5 rounded-full bg-slate-100" />
                <div className="h-3 w-2/3 rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
