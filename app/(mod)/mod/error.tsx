"use client";

import { RouteErrorState } from "@/components/layout/RouteErrorState";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <RouteErrorState
      error={error}
      title="Moderator workspace could not load"
      unstable_retry={unstable_retry}
    />
  );
}
