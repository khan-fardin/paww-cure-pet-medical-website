import type { Metadata } from "next";
import Link from "next/link";
import { HeartPulse, ShieldCheck, Stethoscope } from "lucide-react";

export const metadata: Metadata = {
  title: "About pawwcure",
};

const values = [
  {
    icon: Stethoscope,
    title: "Vet-led care",
    text: "Verified veterinary professionals support users through video consultations, records, and prescriptions.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted records",
    text: "Every pet can build a useful health history from consultations, prescriptions, documents, and reminders.",
  },
  {
    icon: HeartPulse,
    title: "Mobile-first support",
    text: "The platform is designed around quick decisions from a phone, especially during stressful pet health moments.",
  },
] as const;

export default function AboutPage() {
  return (
    <section className="px-6 pb-20 pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            About
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Better pet care, without the waiting room.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-500">
            pawwcure connects pet users with verified vets, keeps pet health
            history organized, and makes follow-up care easier after every
            consultation.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <div
                className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm"
                key={value.title}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">{value.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {value.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-[3rem] bg-emerald-950 p-8 text-white md:p-12">
          <h2 className="text-3xl font-bold">Ready to find a vet?</h2>
          <p className="mt-3 max-w-2xl text-emerald-100/70">
            Browse verified profiles, choose a real availability slot, and book
            a secure online consultation.
          </p>
          <Link
            className="mt-6 inline-flex rounded-2xl bg-white px-6 py-4 text-sm font-bold text-emerald-950"
            href="/vets"
          >
            Find Vets
          </Link>
        </div>
      </div>
    </section>
  );
}
