import type { Metadata } from "next";

import { RegisterForm } from "@/components/public/RegisterForm";

export const metadata: Metadata = {
  title: "Create account | pawwcure",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
