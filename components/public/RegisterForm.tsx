"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Loader, CheckCircle } from "lucide-react";

import { AuthPanel } from "@/components/public/AuthPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    terms: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate
    if (!formData.terms) {
      setError("Please accept the terms");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthPanel
        badge="Success!"
        kicker="Your account has been created"
        title="Account created"
      >
        <div className="flex flex-col items-center gap-4 py-8">
          <CheckCircle className="h-16 w-16 text-emerald-600" />
          <p className="text-center text-slate-600">
            Welcome to pawwcure! Redirecting to your dashboard...
          </p>
        </div>
      </AuthPanel>
    );
  }

  return (
    <AuthPanel
      badge="Join pawwcure"
      kicker="Create a user account for pet care, consultation booking, records, documents, and reminders."
      title="Create your account"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Full name
            </span>
            <Input
              autoComplete="name"
              disabled={loading}
              name="name"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              required
              type="text"
              value={formData.name}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Phone
            </span>
            <Input
              autoComplete="tel"
              disabled={loading}
              name="phone"
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+880"
              required
              type="tel"
              value={formData.phone}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Email address
          </span>
          <Input
            autoComplete="email"
            disabled={loading}
            name="email"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@example.com"
            required
            type="email"
            value={formData.email}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Password
          </span>
          <Input
            autoComplete="new-password"
            disabled={loading}
            name="password"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Create a secure password (min 8 chars)"
            required
            type="password"
            value={formData.password}
          />
          <p className="mt-1 text-xs text-slate-500">
            Must be at least 8 characters
          </p>
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500 cursor-pointer">
          <input
            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            checked={formData.terms}
            disabled={loading}
            onChange={(e) =>
              setFormData({ ...formData, terms: e.target.checked })
            }
            required
            type="checkbox"
          />
          <span>
            I agree to receive account updates, consultation reminders, and pet
            care notifications from pawwcure.
          </span>
        </label>

        <Button
          className="w-full py-4 text-base flex items-center justify-center gap-2"
          disabled={loading}
          type="submit"
        >
          {loading && <Loader className="h-4 w-4 animate-spin" />}
          {loading ? "Creating account..." : "Create Free Account"}
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
      </div>
    </AuthPanel>
  );
}
