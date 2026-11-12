import { NextResponse } from "next/server";
import { createOrder, OrderError } from "@/lib/orders";
import { rateLimit } from "@/lib/rate-limit";
import { orderDraftSchema } from "@/lib/schemas";
import { getCurrentUser } from "@/lib/session";

/**
 * Create an order from the checkout payload (guest or signed in).
 * Validates the typed OrderDraft, re-prices server-side, saves it, runs the
 * mock payment + fulfillment and returns where to find the confirmation.
 */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`order:${ip}`, 20, 60 * 60_000).ok) {
    return NextResponse.json({ ok: false, error: "Too many orders from here. Try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = orderDraftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Some checkout details are missing or invalid." }, { status: 400 });
  }

  try {
    const user = await getCurrentUser();
    const order = await createOrder(parsed.data, user?.id ?? null);
    return NextResponse.json(
      { ok: true, number: order.number, url: `/orders/${order.number}?t=${order.accessToken}` },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[orders] failed", err);
    return NextResponse.json({ ok: false, error: "Something went wrong placing your order. You haven't been charged." }, { status: 500 });
  }
}
