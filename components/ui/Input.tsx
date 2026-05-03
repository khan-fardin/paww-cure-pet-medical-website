import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const fieldClasses =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-[#1A1A1A] outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100";

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(fieldClasses, "min-h-32 resize-none", className)}
      {...props}
    />
  );
}
