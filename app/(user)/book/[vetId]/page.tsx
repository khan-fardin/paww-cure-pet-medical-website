import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { getDemoVet } from "@/lib/demo/publicContent";
import { demoPets } from "@/lib/demo/userContent";

type BookingPageProps = {
  params: Promise<{ vetId: string }>;
};

export const metadata: Metadata = {
  title: "Book Consultation | pawwcure",
};

export default async function BookingPage({ params }: BookingPageProps) {
  const { vetId } = await params;
  const vet = getDemoVet(vetId);

  if (!vet) {
    notFound();
  }

  return (
    <section>
      <div className="mb-8">
        <div className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          Booking
        </div>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Book {vet.name}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-slate-500">
          Three-step booking skeleton for pet selection, slot choice, and
          payment confirmation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
          <div className="relative h-72">
            <Image
              alt={vet.name}
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              src={vet.avatar}
            />
          </div>
          <div className="p-7">
            <h2 className="text-2xl font-bold">{vet.name}</h2>
            <p className="mt-2 text-slate-500">{vet.consultFee}</p>
          </div>
        </div>

        <div className="space-y-5">
          {[
            {
              detail: demoPets.map((pet) => pet.name).join(", "),
              label: "Step 1",
              title: "Choose pet",
            },
            {
              detail: `${vet.nextSlot} / ${vet.availability}`,
              label: "Step 2",
              title: "Select slot",
            },
            {
              detail: "Stripe payment element placeholder",
              label: "Step 3",
              title: "Confirm order",
            },
          ].map((step) => (
            <div
              className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm"
              key={step.label}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {step.label}
              </p>
              <h2 className="mt-2 text-2xl font-bold">{step.title}</h2>
              <p className="mt-2 text-slate-500">{step.detail}</p>
            </div>
          ))}
          <Button type="button">Continue Booking</Button>
        </div>
      </div>
    </section>
  );
}
