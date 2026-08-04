import {
  TrendingUp,
  CreditCard,
  Home,
  Settings,
  Sliders,
  Users,
  BarChart3,
  FileText,
  History,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { HeaderProfileChip } from "@/components/layout/HeaderProfileChip";
import { NotificationBar } from "@/components/layout/NotificationBar";
import { MobileAdminNav } from "@/components/admin/MobileAdminNav";

const navItems = [
  { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/vets", icon: Sliders, label: "Vets" },
  { href: "/admin/content", icon: FileText, label: "Content" },
  { href: "/admin/review-audit", icon: History, label: "Review Audit" },
  { href: "/admin/payments", icon: CreditCard, label: "Payments" },
  { href: "/admin/roles", icon: BarChart3, label: "Roles" },
  { href: "/admin/analytics", icon: TrendingUp, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const adminAvatar = "https://i.pravatar.cc/120?u=admin";

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 overflow-y-auto overscroll-contain border-r border-slate-100 bg-white px-5 py-6 [scrollbar-width:thin] lg:block">
        <BrandLogo className="mb-10" />
        <div className="mb-8 rounded-4xl bg-rose-50 p-5 text-rose-950">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
            Administrator
          </p>
          <p className="mt-1 text-xl font-bold">Super Admin</p>
          <p className="mt-1 text-sm font-semibold opacity-70">Full platform access</p>
        </div>

        <nav className="space-y-2 pb-8">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
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
            <span className="text-sm font-bold">Admin</span>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="rounded-full bg-rose-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Admin Portal
            </span>
            <p className="text-sm font-bold text-slate-500">Platform Management</p>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBar />
            <HeaderProfileChip
              accent="rose"
              avatar={adminAvatar}
              href="/admin/settings"
              label="Super Admin"
              name="Admin"
            />
          </div>
        </div>
      </header>

      <main className="mobile-safe-bottom px-4 pt-24 sm:px-6 lg:ml-72 lg:px-8 lg:pb-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
      <MobileAdminNav />
    </div>
  );
}
