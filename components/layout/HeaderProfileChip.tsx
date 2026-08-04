import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function HeaderProfileChip({
  accent = "emerald",
  avatar,
  href,
  label,
  name,
}: {
  accent?: "amber" | "emerald" | "rose" | "teal";
  avatar: string;
  href: string;
  label: string;
  name: string;
}) {
  const accentClass = {
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
    teal: "bg-teal-500",
  }[accent];

  return (
    <Link
      className="group inline-flex min-w-0 items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-2 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md sm:pr-3"
      href={href}
    >
      <span className="relative shrink-0">
        <Image
          alt={name}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
          height={40}
          src={avatar}
          width={40}
        />
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${accentClass}`}
        />
      </span>
      <span className="hidden min-w-0 text-left sm:block">
        <span className="block max-w-36 truncate text-sm font-bold leading-tight text-slate-900">
          {name}
        </span>
        <span className="block max-w-36 truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </span>
      <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500 sm:block" />
    </Link>
  );
}
