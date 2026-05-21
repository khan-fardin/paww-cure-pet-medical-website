import type { Metadata } from "next";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { NewPetForm } from "@/components/user/NewPetForm";

export const metadata: Metadata = {
  title: "Add Pet | pawwcure",
};

export default function NewPetPage() {
  return (
    <UserPageScaffold
      description="Create a pet profile so you can attach the right patient to consultations, records, prescriptions, and reminders."
      eyebrow="New pet"
      title="Add a pet"
    >
      <NewPetForm />
    </UserPageScaffold>
  );
}
