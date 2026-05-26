"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";

const dockLinks = [
  { href: "/articles", label: "Articles" },
  { href: "/vets", label: "Vets" },
  { href: "/apply-as-vet", label: "For Vets" },
] as const;

const menuLinks = [
  { href: "/", label: "Home" },
  ...dockLinks,
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Join Now" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobilePublicNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[120] md:hidden">
      <div
        className={cn(
          "mb-3 overflow-hidden rounded-[2rem] border border-black/5 bg-white/95 shadow-[0_20px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300",
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <div className="grid grid-cols-2 gap-2 p-3">
          {menuLinks.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-2xl px-4 py-3 text-center text-sm font-bold transition",
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700",
                )}
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <nav
        aria-label="Mobile public navigation"
        className="pointer-events-auto grid grid-cols-4 items-center gap-1 rounded-full border border-black/5 bg-white/90 p-1.5 shadow-[0_18px_36px_rgba(15,23,42,0.14)] backdrop-blur-xl"
      >
        {dockLinks.map((item) => {
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "min-w-0 rounded-full px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider transition",
                isActive
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700",
              )}
              href={item.href}
              key={item.href}
              onClick={() => setIsOpen(false)}
            >
              <span className="block truncate">{item.label}</span>
            </Link>
          );
        })}

        <button
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className={cn(
            "min-w-0 rounded-full px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider transition",
            isOpen
              ? "bg-emerald-950 text-white"
              : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700",
          )}
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          Menu
        </button>
      </nav>
    </div>
  );
}
