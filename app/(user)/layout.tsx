import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { UserShell } from "@/components/user/UserShell";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  // if (!cookieStore.get("access_token")?.value) {
  //   redirect("/login?returnUrl=/dashboard");
  // }

  return <UserShell>{children}</UserShell>;
}
