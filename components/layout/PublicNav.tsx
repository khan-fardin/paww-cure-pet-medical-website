"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  HeartPulse,
  LifeBuoy,
  LogOut,
  MessageSquareText,
  Settings,
  Stethoscope,
  User as UserIcon,
} from "lucide-react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { MobilePublicNav } from "@/components/layout/MobilePublicNav";

const navLinks = [
  { href: "/vets", label: "Find Vets" },
  { href: "/about", label: "About" },
  { href: "/apply-as-vet", label: "Join as a Vet" },
  { href: "/articles", label: "Articles" },
] as const;

type User = {
  name: string;
  avatar?: string;
  role: string;
};

function roleHome(role: string) {
  if (role === "vet") return "/vet/dashboard";
  if (role === "mod") return "/mod/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
}

function accountLinks(role: string) {
  if (role === "vet") {
    return [
      { href: "/vet/consultations", icon: Stethoscope, label: "Consultations" },
      { href: "/vet/profile", icon: Settings, label: "Vet Profile" },
      { href: "/vet/reviews", icon: MessageSquareText, label: "Reviews" },
    ];
  }

  if (role === "mod") {
    return [
      { href: "/mod/tickets", icon: LifeBuoy, label: "Support Tickets" },
      { href: "/mod/vets", icon: Stethoscope, label: "Vet Review" },
      { href: "/mod/flags", icon: MessageSquareText, label: "Flags" },
    ];
  }

  if (role === "admin") {
    return [
      { href: "/admin/users", icon: UserIcon, label: "Users" },
      { href: "/admin/payments", icon: HeartPulse, label: "Payments" },
      { href: "/admin/settings", icon: Settings, label: "Settings" },
    ];
  }

  return [
    { href: "/profile", icon: UserIcon, label: "My Profile" },
    { href: "/pets", icon: HeartPulse, label: "My Pets" },
    { href: "/support", icon: LifeBuoy, label: "Support" },
  ];
}

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
                  className="group inline-flex min-w-0 items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-2 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md sm:pr-3"
                  onClick={() => setShowDropdown(!showDropdown)}
                  type="button"
                >
                  <span className="relative shrink-0">
                    <Image
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                      height={40}
                      src={
                        user.avatar ??
                        `https://i.pravatar.cc/120?u=${encodeURIComponent(user.name)}`
                      }
                      width={40}
                    />
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                  </span>
                  <span className="hidden min-w-0 text-left sm:block">
                    <span className="block max-w-36 truncate text-sm font-bold leading-tight text-slate-900">
                      {user.name}
                    </span>
                    <span className="block max-w-36 truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {user.role}
                    </span>
                  </span>
                  <ChevronDown className="hidden h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-slate-500 sm:block" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/80">
                    <div className="bg-slate-50/80 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Image
                          alt={user.name}
                          className="h-11 w-11 rounded-full object-cover ring-2 ring-white"
                          height={44}
                          src={
                            user.avatar ??
                            `https://i.pravatar.cc/120?u=${encodeURIComponent(user.name)}`
                          }
                          width={44}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-950">
                            {user.name}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                            {user.role} account
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-700"
                        href={roleHome(user.role)}
                        onClick={() => setShowDropdown(false)}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <UserIcon className="h-4 w-4" />
                        </span>
                        <span>Dashboard</span>
                      </Link>

                      {accountLinks(user.role).map((item) => {
                        const Icon = item.icon;

                        return (
                          <Link
                            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                            href={item.href}
                            key={item.href}
                            onClick={() => setShowDropdown(false)}
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 p-2">
                      <button
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                        onClick={handleLogout}
                        type="button"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
                          <LogOut className="h-4 w-4" />
                        </span>
                        Log out
                      </button>
                    </div>
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
