"use client";

import {
  Bell,
  Clock,
  DollarSign,
  Home,
  Menu,
  MessageSquare,
  Settings,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";

const dockItems = [
  { href: "/vet/dashboard", icon: Home, label: "Home" },
  { href: "/vet/consultations", icon: Stethoscope, label: "Consults" },
  { href: "/vet/patients", icon: Users, label: "Patients" },
  { href: "/vet/earnings", icon: DollarSign, label: "Earnings" },
] as const;

const menuItems = [
  ...dockItems,
  { href: "/vet/availability", icon: Clock, label: "Availability" },
  { href: "/vet/profile", icon: Settings, label: "Profile" },
  { href: "/vet/reviews", icon: MessageSquare, label: "Reviews" },
] as const;

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileVetNav() {
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
                    ? "bg-teal-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-700",
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
        aria-label="Mobile vet navigation"
        className="grid grid-cols-5 items-center gap-1 rounded-full border border-black/5 bg-white/90 p-1.5 shadow-[0_18px_36px_rgba(15,23,42,0.16)] backdrop-blur-xl"
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
                  ? "bg-teal-600 text-white"
                  : "bg-transparent text-slate-600 hover:text-teal-700",
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
              : "bg-transparent text-slate-600 hover:text-teal-700",
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
