"use client";

import { motion } from "framer-motion";
import { TruckIcon } from "@/components/ui/Icons";
import { EASE_OUT } from "@/lib/motion";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

export function FreeShippingMeter({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);
  return (
    <div>
      <p className="flex items-center gap-2 text-sm" aria-live="polite">
        <TruckIcon size={18} className="text-brown" />
        {remaining > 0 ? (
          <span>
            You&apos;re <strong className="tabular-nums">{formatPrice(remaining)}</strong> away from free shipping.
          </span>
        ) : (
          <span>
            <strong>Free standard shipping</strong> unlocked.
          </span>
        )}
      </p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-navy/10" aria-hidden>
        <motion.div
          className="h-full origin-left rounded-full bg-accent"
          initial={false}
          animate={{ scaleX: progress }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        />
      </div>
    </div>
  );
}
