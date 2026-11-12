/**
 * Shared pricing rules (client + server). The server is the source of truth:
 * POST /api/orders re-prices every line from the data layer.
 */
import { FREE_SHIPPING_THRESHOLD } from "@/lib/site";
import { roundMoney } from "@/lib/utils";
import type { OrderTotals, ShippingMethod, ShippingMethodId } from "@/types";

export const SHIPPING_METHODS: Record<ShippingMethodId, ShippingMethod> = {
  standard: {
    id: "standard",
    label: "Standard",
    description: "5–8 business days. Printed to order, shipped tracked.",
    price: 6,
  },
  express: {
    id: "express",
    label: "Express",
    description: "2–3 business days after printing.",
    price: 18,
  },
};

/** Placeholder flat tax rate. Phase 2: Stripe Tax or provider-calculated. */
export const TAX_RATE = 0;

export function shippingCost(subtotal: number, method: ShippingMethodId): number {
  if (subtotal <= 0) return 0;
  if (method === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_METHODS[method].price;
}

export function computeTotals(subtotal: number, method: ShippingMethodId): OrderTotals {
  const shipping = shippingCost(subtotal, method);
  const tax = roundMoney(subtotal * TAX_RATE);
  return {
    subtotal: roundMoney(subtotal),
    shipping,
    tax,
    total: roundMoney(subtotal + shipping + tax),
    currency: "USD",
  };
}
