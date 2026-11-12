import type { ProductColor, ProductSize } from "./product";

/**
 * Order domain types. `Order` is the single typed payload produced by
 * checkout — in Phase 2 it is persisted as-is:
 *   orders        ← Order (scalar fields + JSON for addresses/totals)
 *   order_items   ← OrderItem (order_id FK)
 *   gift_details  ← GiftDetails (order_id FK, nullable)
 */

export interface Address {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  region: string; // state / province
  postalCode: string;
  country: string; // ISO 3166-1 alpha-2
  phone?: string;
}

export interface ContactDetails {
  email: string;
  phone?: string;
  marketingOptIn: boolean;
}

export interface GiftDetails {
  recipient: Address;
  message: string;
  /** Leave prices off the packing slip */
  hidePrices: boolean;
}

export type ShippingMethodId = "standard" | "express";

export interface ShippingMethod {
  id: ShippingMethodId;
  label: string;
  description: string;
  price: number;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  size: ProductSize;
  color: ProductColor;
  unitPrice: number;
  quantity: number;
  image: string;
  designerName: string;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: "USD";
}

export type OrderStatus = "pending_payment" | "paid" | "in_production" | "shipped" | "delivered" | "cancelled";

export type PaymentProviderId = "mock" | "stripe";
export type FulfillmentProviderId = "mock" | "printful";

export interface PaymentInfo {
  provider: PaymentProviderId;
  status: "requires_payment" | "succeeded" | "failed";
  /** e.g. Stripe PaymentIntent id */
  reference?: string;
}

/** What the browser sends to POST /api/orders. */
export interface OrderDraft {
  contact: ContactDetails;
  /** The buyer's address (billing). */
  billingAddress: Address;
  isGift: boolean;
  gift: GiftDetails | null;
  shippingMethod: ShippingMethodId;
  items: Pick<OrderItem, "productId" | "variantId" | "quantity">[];
}

/** The full order as created by the server. */
export interface Order {
  id: string;
  number: string;
  createdAt: string; // ISO
  status: OrderStatus;
  /** Phase 2: set when the buyer is signed in */
  userId: string | null;
  contact: ContactDetails;
  billingAddress: Address;
  /** Where the parcel goes — the gift recipient when isGift */
  shippingAddress: Address;
  isGift: boolean;
  gift: GiftDetails | null;
  shippingMethod: ShippingMethod;
  items: OrderItem[];
  totals: OrderTotals;
  payment: PaymentInfo;
  fulfillment: { provider: FulfillmentProviderId; externalId?: string };
}
