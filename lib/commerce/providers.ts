/**
 * Commerce provider seams. Phase 1 ships mock implementations; swap them
 * for Stripe / Printful by implementing the same interfaces and changing
 * the exports at the bottom of this file. Nothing else needs to change.
 */
import type { FulfillmentProviderId, Order, PaymentInfo, PaymentProviderId } from "@/types";

export interface PaymentProvider {
  id: PaymentProviderId;
  /**
   * Create a payment for the order. For Stripe this would create a
   * PaymentIntent and return its client_secret for the Payment Element.
   */
  createPayment(order: Order): Promise<PaymentInfo & { clientSecret?: string }>;
}

export interface FulfillmentProvider {
  id: FulfillmentProviderId;
  /**
   * Hand the paid order to print-on-demand. For Printful this maps each
   * OrderItem.variantId → sync_variant_id and POSTs /orders.
   */
  createFulfillment(order: Order): Promise<{ externalId: string }>;
}

const mockPayments: PaymentProvider = {
  id: "mock",
  async createPayment(order) {
    return { provider: "mock", status: "succeeded", reference: `mock_pi_${order.id}` };
  },
};

const mockFulfillment: FulfillmentProvider = {
  id: "mock",
  async createFulfillment(order) {
    return { externalId: `mock_fo_${order.id}` };
  },
};

/*
 * Example Stripe adapter (not installed — requires the `stripe` package):
 *
 * import Stripe from "stripe";
 * const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 * export const stripePayments: PaymentProvider = {
 *   id: "stripe",
 *   async createPayment(order) {
 *     const pi = await stripe.paymentIntents.create({
 *       amount: Math.round(order.totals.total * 100),
 *       currency: "usd",
 *       metadata: { orderId: order.id },
 *       receipt_email: order.contact.email,
 *     });
 *     return { provider: "stripe", status: "requires_payment", reference: pi.id, clientSecret: pi.client_secret ?? undefined };
 *   },
 * };
 */

export const payments: PaymentProvider = mockPayments;
export const fulfillment: FulfillmentProvider = mockFulfillment;
