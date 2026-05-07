import type { Metadata } from "next";
import Link from "next/link";

import { AuthPanel } from "@/components/public/AuthPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Create account | pawwcure",
};

export default function RegisterPage() {
  return (
    <AuthPanel
      badge="Join pawwcure"
      kicker="Create a user account for pet care, consultation booking, records, documents, and reminders."
      title="Create your account"
    >
      <form action="/api/auth/register" className="space-y-5" method="post">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Full name
            </span>
            <Input
              autoComplete="name"
              name="name"
              placeholder="Your name"
              required
              type="text"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Phone
            </span>
            <Input
              autoComplete="tel"
              name="phone"
              placeholder="+880"
              required
              type="tel"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Email address
          </span>
          <Input
            autoComplete="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Password
          </span>
          <Input
            autoComplete="new-password"
            name="password"
            placeholder="Create a secure password"
            required
            type="password"
          />
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
          <input
            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            required
            type="checkbox"
          />
          <span>
            I agree to receive account updates, consultation reminders, and pet
            care notifications from pawwcure.
          </span>
        </label>

        <Button className="w-full py-4 text-base" type="submit">
          Create Free Account
        </Button>
      </form>

      <div className="mt-8 flex flex-col gap-3 text-center text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p>
          Already registered?{" "}
          <Link
            className="font-bold text-emerald-600 hover:text-emerald-700"
            href="/login"
          >
            Log in
          </Link>
        </p>
        <Link
          className="font-bold text-emerald-600 hover:text-emerald-700"
          href="/apply-as-vet"
        >
          Apply as vet
        </Link>
      </div>
    </AuthPanel>
  );
}
