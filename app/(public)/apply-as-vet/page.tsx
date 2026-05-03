import type { Metadata } from "next";

import { VetApplicationWizard } from "@/components/public/VetApplicationWizard";

export const metadata: Metadata = {
  title: "Apply as vet | pawwcure",
};

export default function ApplyAsVetPage() {
  return <VetApplicationWizard />;
}
