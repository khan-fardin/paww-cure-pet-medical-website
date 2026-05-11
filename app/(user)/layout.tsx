import { redirect } from "next/navigation";

import { UserShell } from "@/components/user/UserShell";
import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Pet } from "@/lib/db/models/Pet";
import { User } from "@/lib/db/models/User";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session) {
    redirect("/login?returnUrl=/dashboard");
  }

  await dbConnect();
  const [user, activePet] = await Promise.all([
    User.findById(session.userId).select("name avatar").lean(),
    Pet.findOne({ userId: session.userId, isActive: true })
      .sort({ createdAt: 1 })
      .select("name breed weight")
      .lean(),
  ]);

  return (
    <UserShell
      activePet={
        activePet
          ? {
              breed: activePet.breed,
              name: activePet.name,
              weight: `${activePet.weight} kg`,
            }
          : undefined
      }
      user={
        user
          ? {
              avatar: user.avatar,
              name: user.name,
            }
          : undefined
      }
    >
      {children}
    </UserShell>
  );
}
