import type { Metadata } from "next";

import { FullPageState } from "@/components/layout/RouteState";

export const metadata: Metadata = {
  title: "Unauthorized | pawwcure",
};

export default function UnauthorizedPage() {
  return (
    <FullPageState
      actionHref="/login"
      actionLabel="Go to Login"
      code="401"
      description="Your session is missing or expired. Log in again to continue securely."
      secondaryHref="/"
      secondaryLabel="Back to Home"
      title="Authentication required"
      variant="auth"
    />
  );
}
