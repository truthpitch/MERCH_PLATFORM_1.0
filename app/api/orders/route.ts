import { NextResponse } from "next/server";
import { createOrder, OrderError } from "@/lib/orders";
import { orderDraftSchema } from "@/lib/schemas";

/**
 * Create an order from the checkout payload.
 * Validates the typed OrderDraft, re-prices server-side, runs the (mock)
 * payment + fulfillment providers, and returns the full Order.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = orderDraftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Some checkout details are missing or invalid." }, { status: 400 });
  }

  try {
    const order = await createOrder(parsed.data);
    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[orders] failed", err);
    return NextResponse.json({ ok: false, error: "Something went wrong placing your order." }, { status: 500 });
  }
}
