import {
  CalendarDays,
  Cat,
  CreditCard,
  FileText,
  Home,
  LifeBuoy,
  MessageSquareText,
  Search,
  Stethoscope,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { NotificationBar } from "@/components/layout/NotificationBar";
import { MobileUserNav } from "@/components/user/MobileUserNav";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/vets", icon: Search, label: "Find Vets" },
  { href: "/consultations", icon: Stethoscope, label: "Consultations" },
  { href: "/pets", icon: Cat, label: "Pets" },
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/reminders", icon: CalendarDays, label: "Reminders" },
  { href: "/payments", icon: CreditCard, label: "Payments" },
  { href: "/support", icon: LifeBuoy, label: "Support" },
  { href: "/my-reviews", icon: MessageSquareText, label: "My Reviews" },
  { href: "/profile", icon: UserRound, label: "My Profile" },
] as const;

type ShellPet = {
  breed?: string;
  name: string;
  weight?: string;
};

type ShellUser = {
  avatar?: string;
  name: string;
};

export function UserShell({
  activePet: realActivePet,
  children,
  user,
}: {
  activePet?: ShellPet;
  children: ReactNode;
  user?: ShellUser;
}) {
  const activePet = realActivePet;
  const currentUser = user ?? { name: "User" };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 overflow-y-auto overscroll-contain border-r border-slate-100 bg-white px-5 py-6 [scrollbar-width:thin] lg:block">
        <BrandLogo className="mb-10" />
        <div className="mb-8 rounded-[2rem] bg-emerald-50 p-5 text-emerald-950">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
            Active pet
          </p>
          <p className="mt-1 text-xl font-bold">
            {activePet?.name ?? "No active pet"}
          </p>
          <p className="mt-1 text-sm font-semibold opacity-70">
            {activePet ? `${activePet.breed} / ${activePet.weight}` : "Add a pet to start booking"}
          </p>
        </div>

        <nav className="space-y-2 pb-8">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-black/5 bg-white/85 backdrop-blur-xl lg:left-72">
        <div className="flex h-full items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <BrandLogo showText={false} />
            <span className="text-sm font-bold">User portal</span>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              User portal
            </span>
            <p className="text-sm font-bold text-slate-500">
              Welcome back, {currentUser.name.split(" ")[0]}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              className="hidden rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 sm:inline-flex"
              href="/pets"
            >
              {activePet?.name ?? "Pets"}
            </Link>
            <NotificationBar />
            <Image
              alt={currentUser.name}
              className="h-10 w-10 rounded-full object-cover"
              height={40}
              src={
                currentUser.avatar ??
                `https://i.pravatar.cc/120?u=${encodeURIComponent(currentUser.name)}`
              }
              width={40}
            />
          </div>
        </div>
      </header>

      <main className="mobile-safe-bottom px-4 pt-24 sm:px-6 lg:ml-72 lg:px-8 lg:pb-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
      <MobileUserNav />
    </div>
  );
}
