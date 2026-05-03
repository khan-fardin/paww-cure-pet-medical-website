import Image from "next/image";
import type { ReactNode } from "react";

type AuthPanelProps = {
  badge: string;
  children: ReactNode;
  kicker: string;
  title: string;
};

export function AuthPanel({ badge, children, kicker, title }: AuthPanelProps) {
  return (
    <section className="px-6 pb-20 pt-32">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[3rem] bg-white shadow-sm ring-1 ring-slate-100 lg:grid-cols-[1fr_0.9fr]">
        <div className="p-8 sm:p-12 lg:p-14">
          <div className="mb-8 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            {badge}
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-[#1A1A1A] md:text-4xl">
            {title}
          </h1>
          <p className="mb-10 max-w-md leading-relaxed text-slate-500">
            {kicker}
          </p>
          {children}
        </div>

        <div className="relative hidden min-h-[620px] overflow-hidden bg-emerald-950 lg:block">
          <Image
            alt="Veterinary care"
            className="object-cover opacity-80 mix-blend-luminosity"
            fill
            sizes="40vw"
            src="https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&q=80&w=900"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/40 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100 backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Vet-led support
            </div>
            <p className="max-w-sm text-3xl font-bold leading-tight text-white">
              Calm, fast care for every stage of pet health.
            </p>
          </div>
          <div className="absolute -right-10 top-10 h-56 w-56 rounded-full bg-emerald-600 opacity-20 blur-[120px]" />
          <div className="absolute -bottom-8 left-0 h-56 w-56 rounded-full bg-blue-600 opacity-20 blur-[120px]" />
        </div>
      </div>
    </section>
  );
}
