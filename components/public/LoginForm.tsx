"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Loader } from "lucide-react";

import { AuthPanel } from "@/components/public/AuthPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Success - redirect
      router.push(data.data.redirectTo || "/dashboard");
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthPanel
      badge="Welcome back"
      kicker="Access consultations, prescriptions, pet records, and reminders from your pawwcure account."
      title="Log in to pawwcure"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Email address
          </span>
          <Input
            autoComplete="email"
            disabled={loading}
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Password
          </span>
          <Input
            autoComplete="current-password"
            disabled={loading}
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            type="password"
            value={password}
          />
        </label>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 font-medium text-slate-500 cursor-pointer">
            <input
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              disabled={loading}
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

        <Button
          className="w-full py-4 text-base flex items-center justify-center gap-2"
          disabled={loading}
          type="submit"
        >
          {loading && <Loader className="h-4 w-4 animate-spin" />}
          {loading ? "Logging in..." : "Log in"}
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
