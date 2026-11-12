"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CartLine } from "@/components/cart/CartLine";
import { FreeShippingMeter } from "@/components/cart/FreeShippingMeter";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, BagIcon, LockIcon } from "@/components/ui/Icons";
import { computeTotals } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { selectItemCount, selectSubtotal, useCart } from "@/store/cart";
import { useUi } from "@/store/ui";

export function CartView() {
  const hydrated = useUi((s) => s.cartHydrated);
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const count = useCart(selectItemCount);
  const clear = useCart((s) => s.clear);
  const totals = computeTotals(subtotal, "standard");

  if (!hydrated) {
    return (
      <div className="container-tp pb-24" aria-busy="true">
        <div className="h-64 animate-pulse rounded-lg bg-navy/5" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-tp pb-24 sm:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center rounded-lg border border-dashed border-navy/20 px-6 py-20 text-center"
        >
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-sand-200 text-brown">
            <BagIcon size={28} />
          </span>
          <p className="mt-6 text-3xl font-bold tracking-tight">Your cart is empty.</p>
          <p className="mt-2 text-muted">Bold of you to visit with nothing in it. Let&apos;s fix that.</p>
          <Button href="/shop" size="lg" className="mt-8" magnetic icon={<ArrowRightIcon size={18} />}>
            Shop the drop
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-tp grid gap-12 pb-24 sm:pb-32 lg:grid-cols-12">
      <section aria-labelledby="cart-items" className="lg:col-span-7">
        <div className="flex items-center justify-between border-b border-navy/10 pb-4">
          <h2 id="cart-items" className="text-lg font-bold">
            {count} {count === 1 ? "item" : "items"}
          </h2>
          <button type="button" onClick={clear} className="text-sm text-muted underline-offset-4 hover:text-navy hover:underline">
            Clear cart
          </button>
        </div>
        <ul className="divide-y divide-navy/10">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <CartLine key={item.id} item={item} size="lg" />
            ))}
          </AnimatePresence>
        </ul>
      </section>

      <aside aria-labelledby="summary-title" className="lg:col-span-5">
        <div className="rounded-lg bg-white p-6 shadow-soft sm:p-8 lg:sticky lg:top-28">
          <h2 id="summary-title" className="text-2xl font-bold tracking-tight">
            Order summary
          </h2>
          <div className="mt-6">
            <FreeShippingMeter subtotal={subtotal} />
          </div>
          <dl className="mt-6 space-y-3 border-t border-navy/10 pt-6 text-[0.9375rem]">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold tabular-nums">{formatPrice(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Standard shipping</dt>
              <dd className="font-semibold tabular-nums">{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Taxes</dt>
              <dd className="text-muted">Calculated at checkout</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-navy/10 pt-4">
              <dt className="font-semibold">Estimated total</dt>
              <dd className="text-2xl font-bold tabular-nums">{formatPrice(totals.total)}</dd>
            </div>
          </dl>
          <Button href="/checkout" size="lg" fullWidth className="mt-8" icon={<ArrowRightIcon size={18} />}>
            Checkout
          </Button>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
            <LockIcon size={14} /> Secure checkout · Gift options available
          </p>
        </div>
      </aside>
    </div>
  );
}
