import { Footer } from "@/components/layout/Footer";
import { PublicNav } from "@/components/layout/PublicNav";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-[#1A1A1A]">
      <PublicNav />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <Footer />
    </div>
  );
}
