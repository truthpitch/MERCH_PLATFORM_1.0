import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout for your TruthPitch order.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="pt-[calc(var(--tp-nav-h)+2.5rem)]">
      <div className="container-tp mb-10">
        <h1 className="text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[0.9] tracking-[-0.05em]">Checkout</h1>
      </div>
      <CheckoutFlow />
    </div>
  );
}
