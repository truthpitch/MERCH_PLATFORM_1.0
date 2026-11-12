import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { googleEnabled } from "@/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/AuthForms";
import { getCurrentUser, safeCallbackUrl } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  OAuthAccountNotLinked: "That email already has an account. Sign in with your password first.",
  AccessDenied: "Access denied. If that's wrong, get in touch.",
  Configuration: "Sign-in is misconfigured on our side. We're on it.",
};

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const sp = await searchParams;
  const callbackUrl = safeCallbackUrl(sp.callbackUrl);
  if (await getCurrentUser()) redirect(callbackUrl);
  const error = typeof sp.error === "string" ? (ERRORS[sp.error] ?? "Something went wrong signing you in. Try again.") : undefined;

  return (
    <AuthShell eyebrow="Welcome back" title={"Sign in."} description="Your designs, your orders, your studio.">
      <SignInForm callbackUrl={callbackUrl} googleEnabled={googleEnabled} notice={error} />
    </AuthShell>
  );
}
