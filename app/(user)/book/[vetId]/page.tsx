import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";

import { BookingCheckout } from "@/components/user/BookingCheckout";
import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Pet } from "@/lib/db/models/Pet";
import "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";

type BookingPageProps = {
  params: Promise<{ vetId: string }>;
};

type BookableVet = {
  _id: { toString(): string };
  bio?: string;
  clinicCity: string;
  clinicName: string;
  consultationDuration: number;
  consultationFee: number;
  specializations: string[];
  userId?: {
    avatar?: string;
    name?: string;
  };
};

type UserPet = {
  _id: { toString(): string };
  breed: string;
  name: string;
  species: string;
};

export const metadata: Metadata = {
  title: "Book Consultation | pawwcure",
};

export default async function BookingPage({ params }: BookingPageProps) {
  const { vetId } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/login?returnUrl=${encodeURIComponent(`/book/${vetId}`)}`);
  }

  if (session.role !== "user") {
    redirect("/dashboard");
  }

  if (!mongoose.Types.ObjectId.isValid(vetId)) {
    notFound();
  }

  await dbConnect();

  const [vet, pets] = await Promise.all([
    VetProfile.findOne({
      _id: vetId,
      acceptingNewPatients: true,
      isActive: true,
      isVerified: true,
    })
      .populate("userId", "name avatar")
      .lean(),
    Pet.find({ userId: session.userId, isActive: true })
      .select("name species breed")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  if (!vet) {
    notFound();
  }

  const bookableVet = vet as unknown as BookableVet;
  const userPets = pets as unknown as UserPet[];
  const vetName = bookableVet.userId?.name ?? "Veterinarian";
  const vetAvatar =
    bookableVet.userId?.avatar ??
    `https://i.pravatar.cc/420?u=${bookableVet._id.toString()}`;
  const platformFee = Math.round(bookableVet.consultationFee * 0.12);
  const total = bookableVet.consultationFee + platformFee;

  return (
    <section>
      <div className="mb-8">
        <div className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          Booking
        </div>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Book {vetName}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-slate-500">
          Review the vet, choose one of your pets, and confirm the consultation
          details. Payment gateway wiring can be added later.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
          <div className="relative h-72 bg-emerald-50">
            <Image
              alt={vetName}
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              src={vetAvatar}
            />
          </div>
          <div className="p-7">
            <h2 className="text-2xl font-bold">{vetName}</h2>
            <p className="mt-2 text-slate-500">{bookableVet.clinicName}</p>
            <p className="mt-1 text-sm text-slate-500">
              {bookableVet.clinicCity}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {bookableVet.specializations.slice(0, 3).map((specialty) => (
                <span
                  className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700"
                  key={specialty}
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>

        {userPets.length === 0 ? (
          <div className="rounded-[2.5rem] border border-amber-100 bg-amber-50 p-7">
            <p className="text-sm font-bold text-amber-900">
              You need to add a pet before booking.
            </p>
            <Link
              className="mt-3 inline-flex rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
              href="/pets/new"
            >
              Add pet
            </Link>
          </div>
        ) : (
          <BookingCheckout
            disabled={userPets.length === 0}
            duration={bookableVet.consultationDuration}
            pets={userPets.map((pet) => ({
              breed: pet.breed,
              id: pet._id.toString(),
              name: pet.name,
              species: pet.species,
            }))}
            total={total}
            vetId={bookableVet._id.toString()}
          />
        )}
      </div>
    </section>
  );
}
