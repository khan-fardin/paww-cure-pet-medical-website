import {
  Bell,
  Clock,
  DollarSign,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Stethoscope,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { MobileVetNav } from "@/components/vet/MobileVetNav";
import { demoVets } from "@/lib/demo/publicContent";

const navItems = [
  { href: "/vet/dashboard", icon: Home, label: "Dashboard" },
  { href: "/vet/consultations", icon: Stethoscope, label: "Consultations" },
  { href: "/vet/patients", icon: Users, label: "Patients" },
  { href: "/vet/availability", icon: Clock, label: "Availability" },
  { href: "/vet/earnings", icon: DollarSign, label: "Earnings" },
  { href: "/vet/profile", icon: Settings, label: "Profile" },
  { href: "/vet/reviews", icon: MessageSquare, label: "Reviews" },
] as const;

export function VetShell({ children }: { children: ReactNode }) {
  const currentVet = demoVets[0]; // Demo: Dr. Amina

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-100 bg-white px-5 py-6 lg:block">
        <BrandLogo className="mb-10" />
        <div className="mb-8 rounded-[2rem] bg-teal-50 p-5 text-teal-950">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
            Vet account
          </p>
          <p className="mt-1 text-xl font-bold">{currentVet.name}</p>
          <p className="mt-1 text-sm font-semibold opacity-70">
            {currentVet.specialties[0]}
          </p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-teal-50 hover:text-teal-700"
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
            <span className="text-sm font-bold">Vet portal</span>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="rounded-full bg-teal-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Vet portal
            </span>
            <p className="text-sm font-bold text-slate-500">
              Welcome back, {currentVet.name.split(" ")[1]}
            </p>
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
              alt={currentVet.name}
              className="h-10 w-10 rounded-full object-cover"
              height={40}
              src={currentVet.avatar}
              width={40}
            />
          </div>
        </div>
      </header>

      <main className="px-4 pb-28 pt-24 sm:px-6 lg:ml-72 lg:px-8 lg:pb-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
      <MobileVetNav />
    </div>
  );
}
