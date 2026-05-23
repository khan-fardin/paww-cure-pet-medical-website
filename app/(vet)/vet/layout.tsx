import { redirect } from "next/navigation";

import { VetShell } from "@/components/vet/VetShell";
import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";

export default async function VetLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session) {
    redirect("/login?returnUrl=/vet/dashboard");
  }

  if (session.role !== "vet") {
    redirect("/dashboard");
  }

  await dbConnect();
  const [user, profile] = await Promise.all([
    User.findById(session.userId).select("name avatar").lean(),
    VetProfile.findOne({ userId: session.userId })
      .select("specializations")
      .lean(),
  ]);

  return (
    <VetShell
      vet={
        user
          ? {
              avatar: user.avatar,
              name: user.name,
              specialty: profile?.specializations?.[0],
            }
          : undefined
      }
    >
      {children}
    </VetShell>
  );
}
