import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "dark";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-600 text-white shadow-xl shadow-emerald-600/25 hover:scale-[1.02] active:scale-95",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:border-emerald-100 hover:bg-emerald-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  dark: "bg-emerald-950 text-white hover:bg-emerald-900",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
