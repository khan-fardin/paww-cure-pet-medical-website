"use client";

import { RouteErrorState } from "@/components/layout/RouteErrorState";
import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <RouteErrorState
          error={error}
          title="pawwcure needs a refresh"
          unstable_retry={unstable_retry}
        />
      </body>
    </html>
  );
}
