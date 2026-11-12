/**
 * Order service (server). Turns a validated OrderDraft into a saved Order:
 *
 *  1. Re-prices every line from the database (client prices are ignored).
 *  2. Saves Order + OrderItems (+ GiftDetails when it's a gift) in one transaction.
 *  3. Runs payment (mock) → hands the order to print-on-demand (mock Printful).
 *  4. Emails the confirmation (console provider for now).
 */
import { PRODUCT_TYPE_SPECS } from "@/lib/catalog";
import { payments } from "@/lib/commerce/providers";
import { db } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";
import { fulfillment } from "@/lib/fulfillment";
import { randomToken } from "@/lib/password";
import { computeTotals, SHIPPING_METHODS } from "@/lib/pricing";
import { getVariantById } from "@/lib/products";
import { appBaseUrl } from "@/lib/url";
import { roundMoney } from "@/lib/utils";
import type { OrderDraft } from "@/types";

export class OrderError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

const toCents = (n: number) => Math.round(n * 100);

async function newOrderNumber(): Promise<string> {
  for (let i = 0; i < 10; i += 1) {
    const number = `TP-${Math.floor(100000 + Math.random() * 900000)}`;
    if (!(await db.order.findUnique({ where: { number }, select: { id: true } }))) return number;
  }
  return `TP-${Date.now().toString().slice(-8)}`;
}

export function formatAddressLines(a: {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}) {
  return [`${a.firstName} ${a.lastName}`, a.line1, a.line2, `${a.city}, ${a.region} ${a.postalCode}`, a.country].filter(Boolean).join("\n");
}

export async function createOrder(draft: OrderDraft, userId: string | null): Promise<{ id: string; number: string; accessToken: string }> {
  // 1. Re-price from the catalog.
  const lines = [];
  for (const line of draft.items) {
    const found = await getVariantById(line.variantId);
    if (!found || found.product.id !== line.productId) {
      throw new OrderError("One of the items in your cart is no longer available. Remove it and try again.");
    }
    lines.push({ ...found, quantity: line.quantity });
  }
  const subtotal = roundMoney(lines.reduce((sum, l) => sum + l.variant.price * l.quantity, 0));
  const totals = computeTotals(subtotal, draft.shippingMethod);
  const number = await newOrderNumber();
  const accessToken = randomToken(24);
  const bill = draft.billingAddress;
  const gift = draft.isGift ? draft.gift : null;

  // 2. Save everything in one go.
  const order = await db.order.create({
    data: {
      number,
      accessToken,
      userId,
      email: draft.contact.email.toLowerCase(),
      phone: draft.contact.phone || null,
      marketingOptIn: draft.contact.marketingOptIn,
      status: "PENDING_PAYMENT",
      shippingMethod: SHIPPING_METHODS[draft.shippingMethod].label,
      subtotalCents: toCents(totals.subtotal),
      shippingCents: toCents(totals.shipping),
      taxCents: toCents(totals.tax),
      totalCents: toCents(totals.total),
      shipFirstName: bill.firstName,
      shipLastName: bill.lastName,
      shipLine1: bill.line1,
      shipLine2: bill.line2 || null,
      shipCity: bill.city,
      shipRegion: bill.region,
      shipPostalCode: bill.postalCode,
      shipCountry: bill.country,
      isGift: Boolean(gift),
      paymentProvider: payments.id,
      fulfillmentProvider: fulfillment.id,
      items: {
        create: lines.map(({ product, variant, quantity }) => ({
          variantId: variant.id,
          quantity,
          unitPriceCents: toCents(variant.price),
          name: product.productTypes.length > 1 ? `${product.name} — ${PRODUCT_TYPE_SPECS[variant.productType].label}` : product.name,
          productType: variant.productType,
          size: variant.size,
          colorName: variant.color.name,
          colorHex: variant.color.hex,
          imageUrl: product.images[0]?.src ?? "",
          designerName: product.designer.name,
        })),
      },
      gift: gift
        ? {
            create: {
              recipientFirstName: gift.recipient.firstName,
              recipientLastName: gift.recipient.lastName,
              recipientLine1: gift.recipient.line1,
              recipientLine2: gift.recipient.line2 || null,
              recipientCity: gift.recipient.city,
              recipientRegion: gift.recipient.region,
              recipientPostalCode: gift.recipient.postalCode,
              recipientCountry: gift.recipient.country,
              message: gift.message,
              hidePrices: gift.hidePrices,
            },
          }
        : undefined,
    },
  });

  // 3. Payment, then fulfillment.
  const payment = await payments.createPayment({
    orderId: order.id,
    orderNumber: number,
    amountCents: order.totalCents,
    currency: "USD",
    email: order.email,
  });
  let status = order.status;
  let fulfillmentId: string | null = null;
  let fulfillmentStatus: string | null = null;

  if (payment.status === "succeeded") {
    status = "PAID";
    try {
      const shipTo = gift?.recipient ?? bill;
      const f = await fulfillment.createOrder({
        externalId: number,
        recipient: {
          name: `${shipTo.firstName} ${shipTo.lastName}`,
          address1: shipTo.line1,
          address2: shipTo.line2,
          city: shipTo.city,
          stateCode: shipTo.region,
          countryCode: shipTo.country,
          zip: shipTo.postalCode,
          email: order.email,
          phone: order.phone,
        },
        items: lines.map(({ product, variant, quantity }) => ({
          sku: variant.sku,
          fulfillmentVariantId: variant.fulfillmentVariantId,
          quantity,
          name: product.name,
          artworkUrl: product.mockup?.artworkUrl ?? product.images[0]?.src ?? "",
        })),
        gift: gift ? { subject: `A gift from ${bill.firstName}`, message: gift.message } : null,
        packingSlipHidePrices: gift?.hidePrices ?? false,
      });
      fulfillmentId = f.externalId;
      fulfillmentStatus = f.status;
      status = "IN_PRODUCTION";
    } catch (err) {
      // Paid but not yet sent to the printer — admin can retry from the dashboard.
      console.error(`[orders] fulfillment failed for ${number}`, err);
    }
  }

  await db.order.update({
    where: { id: order.id },
    data: { status, paymentStatus: payment.status, paymentReference: payment.reference ?? null, fulfillmentId, fulfillmentStatus },
  });

  // 4. Confirmation email.
  const shipTo = gift?.recipient ?? bill;
  await sendOrderConfirmation({
    number,
    email: order.email,
    url: `${await appBaseUrl()}/orders/${number}?t=${accessToken}`,
    totalCents: order.totalCents,
    shippingMethod: order.shippingMethod,
    items: lines.map(({ product, variant, quantity }) => ({
      name: product.name,
      quantity,
      unitPriceCents: toCents(variant.price),
      size: variant.size,
      colorName: variant.color.name,
    })),
    shipTo: formatAddressLines(shipTo),
    isGift: Boolean(gift),
    giftMessage: gift?.message,
  });

  return { id: order.id, number, accessToken };
}
