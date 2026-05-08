import type { Metadata } from "next";

import { LoginForm } from "@/components/public/LoginForm";

export const metadata: Metadata = {
  title: "Log in | pawwcure",
};

export default function LoginPage() {
  return <LoginForm />;
}
