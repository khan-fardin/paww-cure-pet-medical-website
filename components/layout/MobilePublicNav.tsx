"use client";

import {
  BookOpen,
  CircleDollarSign,
  Home,
  Info,
  Menu,
  Search,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";

const dockLinks = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/vets", icon: Search, label: "Vets" },
  { href: "/pricing", icon: CircleDollarSign, label: "Pricing" },
  { href: "/articles", icon: BookOpen, label: "Articles" },
] as const;

const menuLinks = [
  ...dockLinks,
  { href: "/about", icon: Info, label: "About" },
  { href: "/apply-as-vet", icon: Stethoscope, label: "For Vets" },
  { href: "/login", icon: UserRound, label: "Log in" },
  { href: "/register", icon: UserRound, label: "Join Now" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobilePublicNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-3 z-[120] md:hidden">
      <div
        className={cn(
          "pointer-events-auto mb-3 overflow-hidden rounded-[2rem] border border-black/5 bg-white/95 shadow-[0_20px_40px_rgba(0,0,0,0.10)] backdrop-blur-xl transition-all duration-300",
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <div className="grid grid-cols-2 gap-2 p-3">
          {menuLinks.map((item) => {
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
        aria-label="Mobile public navigation"
        className="pointer-events-auto grid grid-cols-5 items-center gap-1 rounded-full border border-black/5 bg-white/92 p-1.5 shadow-[0_18px_36px_rgba(15,23,42,0.16)] backdrop-blur-xl"
      >
        {dockLinks.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              className={cn(
                "flex min-w-0 items-center justify-center rounded-full px-2 py-3 transition",
                isActive
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700",
              )}
              href={item.href}
              key={item.href}
              onClick={() => setIsOpen(false)}
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
            </Link>
          );
        })}

        <button
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className={cn(
            "flex min-w-0 items-center justify-center rounded-full px-2 py-3 transition",
            isOpen
              ? "bg-emerald-950 text-white"
              : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700",
          )}
          onClick={() => setIsOpen((current) => !current)}
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
