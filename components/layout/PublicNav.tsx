"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { MobilePublicNav } from "@/components/layout/MobilePublicNav";

const navLinks = [
  { href: "/vets", label: "Find Vets" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/apply-as-vet", label: "For Vets" },
  { href: "/articles", label: "Articles" },
] as const;

type User = {
  name: string;
  avatar?: string;
  role: string;
};

export function PublicNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get user info from a protected endpoint
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setShowDropdown(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <nav className="fixed top-0 z-100 w-full border-b border-black/5 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6">
          <BrandLogo />

          <div className="hidden items-center rounded-full border border-slate-100 bg-white/80 p-1 shadow-sm md:flex">
            {navLinks.map((item) => (
              <Link
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-emerald-700"
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {loading ? (
              <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:bg-slate-50 sm:px-3"
                  onClick={() => setShowDropdown(!showDropdown)}
                  type="button"
                >
                  {user.avatar ? (
                    <Image
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                      height={32}
                      src={user.avatar}
                      width={32}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium text-slate-700">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white shadow-lg">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">
                        {user.role}
                      </p>
                    </div>

                    <Link
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                      href={
                        user.role === "user"
                          ? "/dashboard"
                          : user.role === "vet"
                            ? "/vet/dashboard"
                            : user.role === "mod"
                              ? "/mod/dashboard"
                              : "/admin/dashboard"
                      }
                      onClick={() => setShowDropdown(false)}
                    >
                      <UserIcon className="h-4 w-4" />
                      Dashboard
                    </Link>

                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition border-t border-slate-100"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  className="hidden rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:inline-flex sm:px-5"
                  href="/login"
                >
                  Log in
                </Link>
                <Link
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 sm:px-5"
                  href="/register"
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <MobilePublicNav />
    </>
  );
}
