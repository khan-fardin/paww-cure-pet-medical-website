"use client";

import {
  TrendingUp,
  // Bell,
  CreditCard,
  FileText,
  History,
  Home,
  Menu,
  Settings,
  Sliders,
  Users,
  X,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";

const dockItems = [
  { href: "/admin/dashboard", icon: Home, label: "Home" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/vets", icon: Sliders, label: "Vets" },
  { href: "/admin/payments", icon: CreditCard, label: "Payments" },
] as const;

const menuItems = [
  ...dockItems,
  { href: "/admin/content", icon: FileText, label: "Content" },
  { href: "/admin/review-audit", icon: History, label: "Review Audit" },
  { href: "/admin/roles", icon: BarChart3, label: "Roles" },
  { href: "/admin/analytics", icon: TrendingUp, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
] as const;

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileAdminNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-3 z-120 lg:hidden">
      <div
        className={cn(
          "mb-3 overflow-hidden rounded-4xl border border-black/5 bg-white/95 shadow-[0_20px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl transition-all duration-300",
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <div className="grid grid-cols-2 gap-2 p-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition",
                  isActive
                    ? "bg-rose-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-700",
                )}
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <nav
        aria-label="Mobile admin navigation"
        className="pointer-events-auto grid grid-cols-5 items-center gap-1 rounded-full border border-black/5 bg-white/90 p-1.5 shadow-[0_18px_36px_rgba(15,23,42,0.16)] backdrop-blur-xl"
      >
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center justify-center rounded-2xl py-3 transition",
                isActive
                  ? "bg-rose-600 text-white"
                  : "bg-transparent text-slate-600 hover:text-rose-700",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
            </Link>
          );
        })}

        <button
          className={cn(
            "flex items-center justify-center rounded-2xl py-3 transition",
            isOpen
              ? "bg-slate-100 text-slate-600"
              : "bg-transparent text-slate-600 hover:text-rose-700",
          )}
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          {isOpen ? (
            <X aria-hidden="true" className="h-5 w-5" />
          ) : (
            <Menu aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </nav>
    </div>
  );
}
