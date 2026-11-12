/**
 * Payment provider seam. Phase 2 still uses a mock; to take real payments,
 * implement `PaymentProvider` with Stripe and change the export below.
 * (Print-on-demand fulfillment lives in lib/fulfillment.ts.)
 */
import type { PaymentInfo, PaymentProviderId } from "@/types";

export interface PaymentRequest {
  orderId: string;
  orderNumber: string;
  amountCents: number;
  currency: "USD";
  email: string;
}

export interface PaymentProvider {
  id: PaymentProviderId;
  /** For Stripe: create a PaymentIntent and return its client_secret for the Payment Element. */
  createPayment(req: PaymentRequest): Promise<PaymentInfo & { clientSecret?: string }>;
}

const mockPayments: PaymentProvider = {
  id: "mock",
  async createPayment(req) {
    return { provider: "mock", status: "succeeded", reference: `mock_pi_${req.orderNumber}` };
  },
};

/*
 * Example Stripe adapter (requires the `stripe` package + STRIPE_SECRET_KEY):
 *
 * import Stripe from "stripe";
 * const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 * export const stripePayments: PaymentProvider = {
 *   id: "stripe",
 *   async createPayment(req) {
 *     const pi = await stripe.paymentIntents.create({
 *       amount: req.amountCents,
 *       currency: "usd",
 *       metadata: { orderId: req.orderId, orderNumber: req.orderNumber },
 *       receipt_email: req.email,
 *     });
 *     return { provider: "stripe", status: "requires_payment", reference: pi.id, clientSecret: pi.client_secret ?? undefined };
 *   },
 * };
 * Then confirm the order in a Stripe webhook (payment_intent.succeeded) and
 * call fulfillment.createOrder there instead of in lib/orders.ts.
 */

export const payments: PaymentProvider = mockPayments;
