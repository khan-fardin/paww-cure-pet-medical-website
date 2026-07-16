import type { Metadata } from "next";

import { FullPageState } from "@/components/layout/RouteState";

export const metadata: Metadata = {
  title: "Page Not Found | pawwcure",
};

export default function NotFound() {
  return (
    <FullPageState
      actionHref="/"
      actionLabel="Back to Home"
      code="404"
      description="The page you are looking for does not exist, or it may have moved."
      secondaryHref="/vets"
      secondaryLabel="Find Vets"
      title="Page not found"
      variant="not-found"
    />
  );
}
