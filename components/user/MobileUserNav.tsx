"use client";

import {
  CalendarDays,
  Cat,
  CreditCard,
  FileText,
  Home,
  Menu,
  Search,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";

const dockItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/vets", icon: Search, label: "Vets" },
  { href: "/consultations", icon: Stethoscope, label: "Consults" },
  { href: "/pets", icon: Cat, label: "Pets" },
] as const;

const menuItems = [
  ...dockItems,
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/reminders", icon: CalendarDays, label: "Reminders" },
  { href: "/payments", icon: CreditCard, label: "Payments" },
] as const;

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileUserNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed inset-x-3 bottom-3 z-[120] lg:hidden">
      <div
        className={cn(
          "mb-3 overflow-hidden rounded-[2rem] border border-black/5 bg-white/95 shadow-[0_20px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl transition-all duration-300",
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
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700",
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
        aria-label="Mobile dashboard navigation"
        className="grid grid-cols-5 items-center gap-1 rounded-full border border-black/5 bg-white/90 p-1.5 shadow-[0_18px_36px_rgba(15,23,42,0.16)] backdrop-blur-xl"
      >
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-full px-2 py-2.5 text-[10px] font-bold transition",
                isActive
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700",
              )}
              href={item.href}
              key={item.href}
              onClick={() => setIsOpen(false)}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              <span className="block max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}

        <button
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close dashboard menu" : "Open dashboard menu"}
          className={cn(
            "flex min-w-0 flex-col items-center gap-1 rounded-full px-2 py-2.5 text-[10px] font-bold transition",
            isOpen
              ? "bg-emerald-950 text-white"
              : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700",
          )}
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <Menu aria-hidden="true" className="h-4 w-4" />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}
