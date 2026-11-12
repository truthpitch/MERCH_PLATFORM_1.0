import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { googleEnabled } from "@/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/AuthForms";
import { getCurrentUser, safeCallbackUrl } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Join TruthPitch, design what you believe, and get it in front of people who mean it.",
  alternates: { canonical: "/sign-up" },
};

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const sp = await searchParams;
  const callbackUrl = safeCallbackUrl(sp.callbackUrl, "/studio");
  if (await getCurrentUser()) redirect(callbackUrl);

  return (
    <AuthShell
      eyebrow="Join the community"
      title={"Make it\nwearable."}
      description="Create an account, upload your design, and submit it for review. Approved designs go live in the marketplace."
      quote={"Your words.\nOur blanks."}
    >
      <SignUpForm callbackUrl={callbackUrl} googleEnabled={googleEnabled} />
    </AuthShell>
  );
}
