/**
 * Order service (server). Turns a validated OrderDraft into a full Order,
 * re-pricing every line from the data layer so client prices can't be
 * tampered with.
 *
 * Phase 2: replace `saveOrder` with a database insert (orders,
 * order_items, gift_details) inside a transaction.
 */
import { fulfillment, payments } from "@/lib/commerce/providers";
import { computeTotals, SHIPPING_METHODS } from "@/lib/pricing";
import { getVariantById } from "@/lib/products";
import { roundMoney } from "@/lib/utils";
import type { Order, OrderDraft, OrderItem } from "@/types";

export class OrderError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

function newId(): string {
  return globalThis.crypto.randomUUID();
}

function orderNumber(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `TP-${n}`;
}

export async function createOrder(draft: OrderDraft, userId: string | null = null): Promise<Order> {
  const items: OrderItem[] = [];
  for (const line of draft.items) {
    const found = await getVariantById(line.variantId);
    if (!found || found.product.id !== line.productId) {
      throw new OrderError(`One of the items in your cart is no longer available.`);
    }
    const { product, variant } = found;
    items.push({
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      size: variant.size,
      color: variant.color,
      unitPrice: variant.price,
      quantity: line.quantity,
      image: product.images[0]?.src ?? "",
      designerName: product.designer.name,
    });
  }

  const subtotal = roundMoney(items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0));
  const id = newId();

  const order: Order = {
    id,
    number: orderNumber(),
    createdAt: new Date().toISOString(),
    status: "pending_payment",
    userId,
    contact: draft.contact,
    billingAddress: draft.billingAddress,
    shippingAddress: draft.isGift && draft.gift ? draft.gift.recipient : draft.billingAddress,
    isGift: draft.isGift,
    gift: draft.isGift ? draft.gift : null,
    shippingMethod: SHIPPING_METHODS[draft.shippingMethod],
    items,
    totals: computeTotals(subtotal, draft.shippingMethod),
    payment: { provider: payments.id, status: "requires_payment" },
    fulfillment: { provider: fulfillment.id },
  };

  const payment = await payments.createPayment(order);
  order.payment = { provider: payment.provider, status: payment.status, reference: payment.reference };

  if (payment.status === "succeeded") {
    order.status = "paid";
    const f = await fulfillment.createFulfillment(order);
    order.fulfillment = { provider: fulfillment.id, externalId: f.externalId };
    order.status = "in_production";
  }

  await saveOrder(order);
  return order;
}

async function saveOrder(order: Order): Promise<void> {
  // Phase 2: await db.order.create({ data: toDbOrder(order) })
  if (process.env.NODE_ENV !== "production") {
    console.info(`[orders] created ${order.number} — ${order.items.length} line(s), total $${order.totals.total}`);
  }
}
