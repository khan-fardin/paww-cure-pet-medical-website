import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { WaitingRoomClient } from "@/components/consultation/WaitingRoomClient";
import { getSession } from "@/lib/auth/session";

type WaitingRoomPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Waiting Room | pawwcure",
};

export default async function WaitingRoomPage({ params }: WaitingRoomPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect(
      `/login?returnUrl=${encodeURIComponent(`/consultation/${id}/waiting`)}`
    );
  }

  return <WaitingRoomClient consultationId={id} />;
}
