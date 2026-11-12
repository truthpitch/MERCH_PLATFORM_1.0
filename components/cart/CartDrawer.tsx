"use client";

import { AnimatePresence } from "framer-motion";
import { CartLine } from "@/components/cart/CartLine";
import { FreeShippingMeter } from "@/components/cart/FreeShippingMeter";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ArrowRightIcon, BagIcon } from "@/components/ui/Icons";
import { formatPrice } from "@/lib/utils";
import { selectItemCount, selectSubtotal, useCart } from "@/store/cart";

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const items = useCart((s) => s.items);
  const lastAddedId = useCart((s) => s.lastAddedId);
  const subtotal = useCart(selectSubtotal);
  const count = useCart(selectItemCount);

  return (
    <Dialog
      open={isOpen}
      onClose={close}
      variant="right"
      title={`Your cart (${count})`}
      footer={
        items.length > 0 ? (
          <div className="space-y-4 px-5 py-5 sm:px-6">
            <FreeShippingMeter subtotal={subtotal} />
            <div className="flex items-baseline justify-between">
              <span className="font-medium">Subtotal</span>
              <span className="text-xl font-bold tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted">Shipping and taxes calculated at checkout.</p>
            <div className="grid grid-cols-2 gap-3">
              <Button href="/cart" variant="outline" onClick={close}>
                View cart
              </Button>
              <Button href="/checkout" onClick={close} icon={<ArrowRightIcon size={18} />}>
                Checkout
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-5 px-6 py-16 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-sand-200 text-brown">
            <BagIcon size={28} />
          </span>
          <div>
            <p className="text-2xl font-bold tracking-tight">Nothing here yet.</p>
            <p className="mt-2 text-muted">Pick something that says what you mean.</p>
          </div>
          <Button href="/shop" onClick={close} icon={<ArrowRightIcon size={18} />}>
            Shop the drop
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-navy/10 px-5 sm:px-6">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <CartLine key={item.id} item={item} highlight={item.id === lastAddedId} onNavigate={close} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Dialog>
  );
}
