"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { EASE_OUT } from "@/lib/motion";
import { cn, formatPrice } from "@/lib/utils";
import { MAX_LINE_QTY, useCart } from "@/store/cart";
import type { CartItem } from "@/types";

interface CartLineProps {
  item: CartItem;
  highlight?: boolean;
  size?: "sm" | "lg";
  onNavigate?: () => void;
}

export function CartLine({ item, highlight, size = "sm", onNavigate }: CartLineProps) {
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const lg = size === "lg";

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className={cn("relative flex gap-4 py-5", lg && "sm:gap-6 sm:py-7")}
    >
      {highlight && (
        <motion.span
          aria-hidden
          className="absolute inset-x-[-0.75rem] inset-y-1 -z-10 rounded-md bg-sand/40"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.6, delay: 0.6 }}
        />
      )}
      <Link
        href={`/shop/${item.slug}`}
        onClick={onNavigate}
        className={cn("relative shrink-0 overflow-hidden rounded-md bg-sand-200", lg ? "h-32 w-24 sm:h-40 sm:w-32" : "h-28 w-22")}
        tabIndex={-1}
        aria-hidden
      >
        <Image src={item.image} alt="" fill sizes={lg ? "128px" : "88px"} className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/shop/${item.slug}`} onClick={onNavigate} className={cn("font-semibold leading-tight hover:text-accent", lg && "sm:text-lg")}>
              {item.name}
            </Link>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted">
              <span aria-hidden className="inline-block h-3 w-3 rounded-full border border-navy/20" style={{ backgroundColor: item.color.hex }} />
              {item.color.name}
              <span aria-hidden>·</span>
              {item.size}
            </p>
            {item.designerName !== "TruthPitch" && <p className="mt-1 text-xs text-muted">Design by {item.designerName}</p>}
          </div>
          <p className="shrink-0 font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={MAX_LINE_QTY}
            onChange={(q) => setQuantity(item.id, q)}
            label={`Quantity for ${item.name}`}
          />
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="text-sm text-muted underline-offset-4 hover:text-navy hover:underline"
            aria-label={`Remove ${item.name} (${item.color.name}, ${item.size}) from cart`}
          >
            Remove
          </button>
        </div>
      </div>
    </motion.li>
  );
}
