import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ConsultationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const cookieStore = await cookies();

  // if (!cookieStore.get("access_token")?.value) {
  //   redirect("/login?returnUrl=/consultation");
  // }

  return children;
}
