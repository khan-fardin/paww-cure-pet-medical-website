import type { Metadata } from "next";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";

export const metadata: Metadata = {
  title: "Payments | pawwcure",
};

export default function PaymentsPage() {
  return (
    <UserPageScaffold
      actionHref="/vets"
      actionLabel="Book Consult"
      description="Payments skeleton for Stripe checkout sessions, webhook-confirmed consultation status, invoices, and refunds."
      eyebrow="Billing"
      title="Payments"
    />
  );
}
