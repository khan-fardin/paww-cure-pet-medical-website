import type { Metadata } from "next";
import Link from "next/link";

import { AuthPanel } from "@/components/public/AuthPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Log in | pawwcure",
};

export default function LoginPage() {
  return (
    <AuthPanel
      badge="Welcome back"
      kicker="Access consultations, prescriptions, pet records, and reminders from your pawwcure account."
      title="Log in to pawwcure"
    >
      <form action="/api/auth/login" className="space-y-5" method="post">
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
            autoComplete="current-password"
            name="password"
            placeholder="Enter your password"
            required
            type="password"
          />
        </label>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 font-medium text-slate-500">
            <input
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              name="remember"
              type="checkbox"
            />
            Remember me
          </label>
          <Link
            className="font-bold text-emerald-600 hover:text-emerald-700"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>

        <Button className="w-full py-4 text-base" type="submit">
          Log in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        New to pawwcure?{" "}
        <Link
          className="font-bold text-emerald-600 hover:text-emerald-700"
          href="/register"
        >
          Create an account
        </Link>
      </p>
    </AuthPanel>
  );
}
