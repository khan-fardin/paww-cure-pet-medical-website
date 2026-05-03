import Link from "next/link";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { MobilePublicNav } from "@/components/layout/MobilePublicNav";

const navLinks = [
  { href: "/vets", label: "Find Vets" },
  { href: "/apply-as-vet", label: "For Vets" },
  { href: "/articles", label: "Articles" },
] as const;

export function PublicNav() {
  return (
    <>
      <nav className="fixed top-0 z-[100] w-full border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <BrandLogo />

          <div className="hidden gap-8 text-sm font-medium text-slate-600 md:flex">
            {navLinks.map((item) => (
              <Link
                className="transition hover:text-emerald-600"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex gap-2 sm:gap-3">
            <Link
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-5"
              href="/login"
            >
              Log in
            </Link>
            <Link
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 sm:px-5"
              href="/register"
            >
              Join Now
            </Link>
          </div>
        </div>
      </nav>
      <MobilePublicNav />
    </>
  );
}
