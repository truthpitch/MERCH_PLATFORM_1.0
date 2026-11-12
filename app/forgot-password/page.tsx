import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account"
      title={"Forgot it?\nHappens."}
      description="Enter your email and we'll send a link to set a new password."
      quote={"Own the miss.\nFix it fast."}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
