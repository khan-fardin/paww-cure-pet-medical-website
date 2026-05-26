import {
  Bell,
  CheckCircle2,
  FileText,
  Flag,
  Home,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { MobileModNav } from "@/components/mod/MobileModNav";

const navItems = [
  { href: "/mod/dashboard", icon: Home, label: "Dashboard" },
  { href: "/mod/vets", icon: CheckCircle2, label: "Vet Verification" },
  { href: "/mod/flags", icon: Flag, label: "Flagged Content" },
  { href: "/mod/tickets", icon: MessageSquare, label: "Support Tickets" },
  { href: "/mod/content", icon: FileText, label: "Content Review" },
] as const;

export function ModShell({ children }: { children: ReactNode }) {
  const modAvatar = "https://i.pravatar.cc/120?u=moderator";

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-100 bg-white px-5 py-6 lg:block">
        <BrandLogo className="mb-10" />
        <div className="mb-8 rounded-[2rem] bg-amber-50 p-5 text-amber-950">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
            Moderator
          </p>
          <p className="mt-1 text-xl font-bold">Content Team</p>
          <p className="mt-1 text-sm font-semibold opacity-70">5 pending items</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-amber-50 hover:text-amber-700"
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
            <span className="text-sm font-bold">Moderator</span>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="rounded-full bg-amber-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Moderator Portal
            </span>
            <p className="text-sm font-bold text-slate-500">Content Moderation</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-2 text-sm font-bold text-slate-600 shadow-sm sm:px-4"
              type="button"
            >
              <Bell aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </button>
            <Image
              alt="Moderator"
              className="h-10 w-10 rounded-full object-cover"
              height={40}
              src={modAvatar}
              width={40}
            />
          </div>
        </div>
      </header>

      <main className="mobile-safe-bottom px-4 pt-24 sm:px-6 lg:ml-72 lg:px-8 lg:pb-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
      <MobileModNav />
    </div>
  );
}
