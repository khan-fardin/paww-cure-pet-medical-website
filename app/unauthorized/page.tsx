import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Unauthorized | pawwcure",
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mb-6">
            <AlertCircle className="h-10 w-10 text-red-700" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">401</h1>
          <p className="text-xl font-bold text-slate-200 mb-2">
            Authentication Required
          </p>
          <p className="text-slate-400">
            Your session has expired or you&apos;re not logged in. Please log in to
            continue.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-5">
            <p className="text-sm font-bold text-slate-300">
              💡 What to do:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>• Log in with your credentials</li>
              <li>• Check that your session hasnapos;t expired</li>
              <li>• Clear cookies if problems persist</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-emerald-700"
            href="/login"
          >
            Go to Login
          </Link>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-600 bg-slate-800/50 px-6 py-4 text-sm font-bold text-slate-300 transition hover:bg-slate-700/50"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          Error Code: 401 Unauthorized
        </p>
      </div>
    </div>
  );
}
