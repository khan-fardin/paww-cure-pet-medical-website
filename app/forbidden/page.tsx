import type { Metadata } from "next";

import { FullPageState } from "@/components/layout/RouteState";

export const metadata: Metadata = {
  title: "Forbidden | pawwcure",
};

export default function ForbiddenPage() {
  return (
    <FullPageState
      actionHref="/dashboard"
      actionLabel="Go to Dashboard"
      code="403"
      description="Your account does not have permission to open this area. If this looks wrong, contact support or ask an admin to review your role."
      secondaryHref="/"
      secondaryLabel="Back to Home"
      title="Access forbidden"
      variant="auth"
    />
  );
}
