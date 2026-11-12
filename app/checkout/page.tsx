import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout for your TruthPitch order.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  return (
    <div className="pt-[calc(var(--tp-nav-h)+2.5rem)]">
      <div className="container-tp mb-10 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[0.9] tracking-[-0.05em]">Checkout</h1>
        {user ? (
          <p className="text-sm text-muted">
            Signed in as <strong className="text-navy">{user.email}</strong> — this order will appear in your dashboard.
          </p>
        ) : (
          <p className="text-sm text-muted">
            Checking out as a guest.{" "}
            <Link href="/sign-in?callbackUrl=/checkout" className="font-semibold text-accent underline-offset-4 hover:underline">
              Sign in
            </Link>{" "}
            to keep track of it.
          </p>
        )}
      </div>
      <CheckoutFlow defaultEmail={user?.email} />
    </div>
  );
}
