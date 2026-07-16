"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

import { FullPageState } from "@/components/layout/RouteState";

export function RouteErrorState({
  error,
  title = "Something went wrong",
  unstable_retry,
}: {
  error: Error & { digest?: string };
  title?: string;
  unstable_retry?: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative">
      <FullPageState
        actionHref="/dashboard"
        actionLabel="Go to Dashboard"
        code={error.digest ? `Error ${error.digest}` : "Unexpected error"}
        description="The page could not finish loading. Try again, or return to your dashboard if the problem continues."
        secondaryHref="/"
        secondaryLabel="Back to Home"
        title={title}
        variant="error"
      />
      {unstable_retry ? (
        <button
          className="fixed bottom-5 left-1/2 inline-flex -translate-x-1/2 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-xl transition hover:bg-slate-800"
          onClick={() => unstable_retry()}
          type="button"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
      ) : null}
    </div>
  );
}
