import { notFound } from "next/navigation";
import mongoose from "mongoose";

import { AgoraSupportRoom } from "@/components/support/AgoraSupportRoom";

export default async function SupportCallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  return <AgoraSupportRoom ticketId={id} />;
}
