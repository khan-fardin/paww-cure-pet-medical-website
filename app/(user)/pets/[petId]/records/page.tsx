import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { getDemoPet } from "@/lib/demo/userContent";

type PetRecordsPageProps = {
  params: Promise<{ petId: string }>;
};

export const metadata: Metadata = {
  title: "Health Records | pawwcure",
};

export default async function PetRecordsPage({ params }: PetRecordsPageProps) {
  const { petId } = await params;
  const pet = getDemoPet(petId);

  if (!pet) {
    notFound();
  }

  return (
    <UserPageScaffold
      actionHref="/documents"
      actionLabel="Upload Document"
      description={`Skeleton health timeline and document references for ${pet.name}.`}
      eyebrow="Health records"
      title={`${pet.name} records`}
    />
  );
}
