// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const cookieStore = await cookies();

  // if (!cookieStore.get("access_token")?.value) {
  //   redirect("/login?returnUrl=/admin/dashboard");
  // }

  return <AdminShell>{children}</AdminShell>;
}
