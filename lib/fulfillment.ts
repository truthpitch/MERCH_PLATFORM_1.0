/**
 * Print-on-demand fulfillment (mock Printful).
 *
 * `createOrder` hands a paid order to the provider; `getStatus` reads it
 * back. The mock simulates Printful's lifecycle over time so the admin
 * area has realistic data. To go live, implement `FulfillmentProvider`
 * with Printful's API (POST /orders, GET /orders/@{external_id}) and
 * switch on PRINTFUL_API_KEY — callers don't change.
 */
import type { OrderStatus } from "@/generated/prisma/client";

export interface FulfillmentRecipient {
  name: string;
  address1: string;
  address2?: string | null;
  city: string;
  stateCode: string;
  countryCode: string;
  zip: string;
  email: string;
  phone?: string | null;
}

export interface FulfillmentOrderInput {
  /** Our order number — Printful's `external_id` */
  externalId: string;
  recipient: FulfillmentRecipient;
  items: { sku: string; fulfillmentVariantId?: string | null; quantity: number; name: string; artworkUrl: string }[];
  gift?: { subject: string; message: string } | null;
  /** Hide prices on the packing slip */
  packingSlipHidePrices?: boolean;
}

export type FulfillmentState = "draft" | "pending" | "inprocess" | "fulfilled" | "canceled" | "failed";

export interface FulfillmentProvider {
  id: "mock" | "printful";
  createOrder(input: FulfillmentOrderInput): Promise<{ externalId: string; status: FulfillmentState }>;
  getStatus(externalId: string): Promise<{ status: FulfillmentState; orderStatus?: OrderStatus; trackingUrl?: string }>;
}

const MINUTE = 60_000;

const mockPrintful: FulfillmentProvider = {
  id: "mock",
  async createOrder(input) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[fulfillment:mock] created ${input.externalId} — ${input.items.length} line(s) → ${input.recipient.city}, ${input.recipient.countryCode}`);
    }
    // Encode the creation time in the id so getStatus can simulate progress.
    return { externalId: `mock_${input.externalId}_${Date.now()}`, status: "pending" };
  },
  async getStatus(externalId) {
    const createdAt = Number(externalId.split("_").pop()) || Date.now();
    const age = Date.now() - createdAt;
    if (age < 2 * MINUTE) return { status: "pending", orderStatus: "PAID" };
    if (age < 10 * MINUTE) return { status: "inprocess", orderStatus: "IN_PRODUCTION" };
    return { status: "fulfilled", orderStatus: "SHIPPED", trackingUrl: "https://example.com/track/MOCK" };
  },
};

export const fulfillment: FulfillmentProvider = mockPrintful;
