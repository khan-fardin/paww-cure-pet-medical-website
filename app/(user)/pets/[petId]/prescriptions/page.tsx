import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { getDemoPet } from "@/lib/demo/userContent";

type PetPrescriptionsPageProps = {
  params: Promise<{ petId: string }>;
};

export const metadata: Metadata = {
  title: "Prescriptions | pawwcure",
};

export default async function PetPrescriptionsPage({
  params,
}: PetPrescriptionsPageProps) {
  const { petId } = await params;
  const pet = getDemoPet(petId);

  if (!pet) {
    notFound();
  }

  return (
    <UserPageScaffold
      actionHref="/reminders"
      actionLabel="Create Reminder"
      description={`Prescription list skeleton for ${pet.name}, ready for medication, dosage, duration, and instruction data.`}
      eyebrow="Prescriptions"
      title={`${pet.name} prescriptions`}
    />
  );
}
