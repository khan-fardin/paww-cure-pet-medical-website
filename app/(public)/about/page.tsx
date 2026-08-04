import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarCheck,
  HeartPulse,
  MessageCircleHeart,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About pawwcure | Mobile-first pet healthcare",
  description:
    "Learn how pawwcure is building a mobile-first veterinary consultation platform for pet users, vets, moderators, and care teams.",
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

const stats = [
  { label: "Demo pets supported", value: "50k+" },
  { label: "Care workflows", value: "12+" },
  { label: "Response focus", value: "24/7" },
] as const;

const workflow = [
  {
    icon: UsersRound,
    title: "Users organize pet care",
    text: "Create a profile, add pets, keep documents, and choose the right vet from verified profiles.",
  },
  {
    icon: CalendarCheck,
    title: "Bookings stay structured",
    text: "Availability, slot booking, payment confirmation, and consultation access follow one clean flow.",
  },
  {
    icon: MessageCircleHeart,
    title: "Care continues after the call",
    text: "Chat history, prescriptions, records, reminders, support tickets, and reviews remain connected.",
  },
] as const;

export default function AboutPage() {
  return (
    <section className="overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              About pawwcure
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
              Pet healthcare built for the way people actually need help.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-500">
              pawwcure is a mobile-first veterinary consultation platform for
              users, vets, moderators, and admins. It brings booking, secure
              calls, chat, prescriptions, records, reviews, support, and payment
              operations into one calm workflow.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex justify-center rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-600/20 transition hover:bg-emerald-700"
                href="/vets"
              >
                Find Vets
              </Link>
              <Link
                className="inline-flex justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                href="/apply-as-vet"
              >
                Apply as Vet
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-emerald-300/30 blur-3xl" />
            <div className="absolute -right-8 bottom-10 h-48 w-48 rounded-full bg-blue-300/30 blur-3xl" />
            <div className="relative overflow-hidden rounded-[3rem] bg-white p-3 shadow-2xl shadow-slate-200/70 ring-1 ring-slate-100">
              <Image
                alt="A calm pet healthcare moment with a dog and its caregiver"
                className="aspect-[4/5] w-full rounded-[2.5rem] object-cover"
                height={900}
                priority
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=85"
                width={720}
              />
              <div className="absolute bottom-6 left-6 right-6 rounded-[2rem] border border-white/30 bg-white/90 p-5 shadow-xl backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Demo mission
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900">
                  Reduce the gap between noticing a pet health problem and
                  reaching trusted veterinary guidance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 rounded-[3rem] border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-3 sm:p-6">
          {stats.map((item) => (
            <div
              className="rounded-[2rem] bg-slate-50 p-5 text-center"
              key={item.label}
            >
              <p className="text-3xl font-bold text-slate-950">{item.value}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl">
          <div className="mb-5 inline-flex rounded-full border border-slate-100 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            What we believe
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            The product should feel simple, even when the care workflow is not.
          </h2>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
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

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {workflow.map((item) => {
            const Icon = item.icon;

            return (
              <div
                className="rounded-[2.5rem] bg-slate-950 p-7 text-white"
                key={item.title}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 overflow-hidden rounded-[3rem] bg-emerald-950 p-8 text-white md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-bold">
                Ready to explore pawwcure?
              </h2>
              <p className="mt-3 max-w-2xl text-emerald-100/70">
                Browse demo vet profiles, read care articles, or apply to join
                the verified vet workflow.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex justify-center rounded-2xl bg-white px-6 py-4 text-sm font-bold text-emerald-950"
                href="/vets"
              >
                Find Vets
              </Link>
              <Link
                className="inline-flex justify-center rounded-2xl border border-white/20 px-6 py-4 text-sm font-bold text-white"
                href="/articles"
              >
                Read Articles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
