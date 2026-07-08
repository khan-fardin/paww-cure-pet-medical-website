import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing | pawwcure",
};

const items = [
  "Verified vet profile and rating",
  "Video consultation booking",
  "Pet health records and prescriptions",
  "Post-session summary and review",
] as const;

export default function PricingPage() {
  return (
    <section className="px-6 pb-20 pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Pricing
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Simple consultation pricing.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-500">
            Each vet sets their own consultation price. The displayed price is
            the final amount users pay, with no extra platform surcharge.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[3rem] bg-white p-8 shadow-sm ring-1 ring-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Typical checkout
            </p>
            <h2 className="mt-3 text-4xl font-bold">One final price</h2>
            <p className="mt-4 leading-relaxed text-slate-500">
              pawwcure retains 20% from the completed payment and records 80%
              as the vet payout.
            </p>
            <Link
              className="mt-8 inline-flex w-full justify-center rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white"
              href="/vets"
            >
              Compare Vets
            </Link>
          </div>

          <div className="rounded-[3rem] bg-emerald-950 p-8 text-white">
            <h2 className="text-2xl font-bold">Included in each booking</h2>
            <div className="mt-6 grid gap-4">
              {items.map((item) => (
                <div className="flex items-center gap-3" key={item}>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
                  <span className="font-semibold text-emerald-50">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
