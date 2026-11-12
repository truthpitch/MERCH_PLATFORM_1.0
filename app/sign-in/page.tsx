import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { features } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/**
 * Phase 2 placeholder. Only reachable when NEXT_PUBLIC_ENABLE_AUTH=true.
 * Replace with your auth provider's sign-in UI (e.g. Auth.js).
 */
export default function SignInPage() {
  if (!features.auth) notFound();
  return (
    <section className="container-tp flex min-h-[70dvh] flex-col justify-center pt-[var(--tp-nav-h)]">
      <p className="eyebrow text-brown">Accounts</p>
      <h1 className="mt-4 text-6xl font-bold tracking-[-0.05em]">Coming soon.</h1>
      <p className="mt-4 max-w-md text-lg text-muted">Accounts, saved orders and design submissions land in the next phase.</p>
      <Button href="/shop" className="mt-8 self-start">
        Back to the shop
      </Button>
    </section>
  );
}
