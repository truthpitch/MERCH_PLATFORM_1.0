import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/AuthForms";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const valid = typeof token === "string" && token.length >= 20;

  return (
    <AuthShell eyebrow="Account" title={"New password."} description={valid ? "Pick something you haven't used before." : undefined}>
      {valid ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="grid gap-6">
          <p className="text-muted">That link is missing or broken. Request a fresh one — it only takes a second.</p>
          <Button href="/forgot-password" size="lg">
            Request a new link
          </Button>
        </div>
      )}
    </AuthShell>
  );
}
