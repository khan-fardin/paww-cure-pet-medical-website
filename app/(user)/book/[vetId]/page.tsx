import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import { Button } from "@/components/ui/Button";
import { User } from "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";
import { Pet } from "@/lib/db/models/Pet";

type BookingPageProps = {
  params: Promise<{ vetId: string }>;
};

export const metadata: Metadata = {
  title: "Book Consultation | pawwcure",
};

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");

export default async function BookingPage({ params }: BookingPageProps) {
  const { vetId } = await params;

  // Get current user from token
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let currentUserId = null;

  if (token) {
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      currentUserId = verified.payload.userId as string;
    } catch {
      // Token invalid, continue as guest
    }
  }

  // Fetch vet profile with user details
  let vet = null;
  try {
    vet = await VetProfile.findById(vetId).populate("userId", "name email avatar").lean();
  } catch {
    notFound();
  }

  if (!vet) {
    notFound();
  }

  // Fetch user's pets if logged in
  let userPets: any[] = [];
  if (currentUserId) {
    userPets = await Pet.find({ userId: currentUserId, isActive: true }).lean();
  }

  const petNames = userPets.length > 0 ? userPets.map((pet) => pet.name).join(", ") : "No pets registered";

  return (
    <section>
      <div className="mb-8">
        <div className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          Booking
        </div>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Book {(vet.userId as any)?.name || "Veterinarian"}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-slate-500">
          Three-step booking skeleton for pet selection, slot choice, and
          payment confirmation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
          <div className="relative h-72">
            {(vet.userId as any)?.avatar && (
              <Image
                alt={(vet.userId as any)?.name || "Vet"}
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                src={(vet.userId as any)?.avatar}
              />
            )}
          </div>
          <div className="p-7">
            <h2 className="text-2xl font-bold">{(vet.userId as any)?.name || "Veterinarian"}</h2>
            <p className="mt-2 text-slate-500">{vet.consultationFee} BDT</p>
            <p className="mt-1 text-sm text-slate-500">{vet.clinicName}</p>
          </div>
        </div>

        <div className="space-y-5">
          {[
            {
              detail: petNames,
              label: "Step 1",
              title: "Choose pet",
            },
            {
              detail: `${vet.consultationDuration} min / Available slots vary`,
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
