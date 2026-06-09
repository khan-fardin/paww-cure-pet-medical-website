import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, Stethoscope } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | pawwcure",
};

export default function ContactPage() {
  return (
    <section className="px-6 pb-20 pt-32">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Contact
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Need help with pawwcure?
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-500">
            Reach out for account support, vet onboarding, payment questions,
            or consultation issues.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Mail,
              label: "Support",
              text: "support@pawwcure.test",
            },
            {
              icon: Stethoscope,
              label: "Vet onboarding",
              text: "vets@pawwcure.test",
            },
            {
              icon: MessageCircle,
              label: "Response time",
              text: "Usually within 24 hours",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm"
                key={item.label}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">{item.label}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            className="rounded-2xl bg-emerald-600 px-6 py-4 text-center text-sm font-bold text-white"
            href="/vets"
          >
            Find Vets
          </Link>
          <Link
            className="rounded-2xl border border-slate-200 px-6 py-4 text-center text-sm font-bold text-slate-600"
            href="/apply-as-vet"
          >
            Apply as Vet
          </Link>
        </div>
      </div>
    </section>
  );
}
