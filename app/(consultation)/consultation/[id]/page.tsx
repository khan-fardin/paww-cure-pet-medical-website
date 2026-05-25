import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AgoraConsultationRoom } from "@/components/consultation/AgoraConsultationRoom";
import { getSession } from "@/lib/auth/session";

type ConsultationRoomPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Consultation Room | pawwcure",
};

export default async function ConsultationRoomPage({
  params,
}: ConsultationRoomPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/login?returnUrl=${encodeURIComponent(`/consultation/${id}`)}`);
  }

  return <AgoraConsultationRoom consultationId={id} />;
}
