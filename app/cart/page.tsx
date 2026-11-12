import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { PageHeader } from "@/components/shop/PageHeader";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your TruthPitch cart.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <PageHeader eyebrow="Your cart" title="Almost yours." highlight={["yours."]} />
      <CartView />
    </>
  );
}
