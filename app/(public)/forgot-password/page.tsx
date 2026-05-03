import type { Metadata } from "next";
import Link from "next/link";

import { AuthPanel } from "@/components/public/AuthPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Forgot password | pawwcure",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPanel
      badge="Account recovery"
      kicker="Enter your account email and pawwcure will send a secure reset link when backend auth is connected."
      title="Reset your password"
    >
      <form action="/api/auth/forgot-password" className="space-y-5" method="post">
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

        <Button className="w-full py-4 text-base" type="submit">
          Send Reset Link
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Remembered it?{" "}
        <Link
          className="font-bold text-emerald-600 hover:text-emerald-700"
          href="/login"
        >
          Back to login
        </Link>
      </p>
    </AuthPanel>
  );
}
