import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { VetShell } from "@/components/vet/VetShell";

export default async function VetLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  if (!cookieStore.get("access_token")?.value) {
    redirect("/login?returnUrl=/vet/dashboard");
  }

  return <VetShell>{children}</VetShell>;
}
