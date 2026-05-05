// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";

import { ModShell } from "@/components/mod/ModShell";

export default async function ModLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const cookieStore = await cookies();

  // if (!cookieStore.get("access_token")?.value) {
  //   redirect("/login?returnUrl=/mod/dashboard");
  // }

  return <ModShell>{children}</ModShell>;
}
