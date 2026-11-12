"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { CartItem, OrderTotals } from "@/types";

export function OrderSummary({ items, totals, shippingLabel }: { items: CartItem[]; totals: OrderTotals; shippingLabel: string }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-soft sm:p-7">
      <h2 className="text-lg font-bold">Order summary</h2>
      <ul className="mt-5 space-y-4">
        {items.map((i) => (
          <li key={i.id} className="flex gap-4">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-sand-200">
              <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />
              <span className="absolute right-1 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1 text-[0.6875rem] font-bold text-white">
                {i.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{i.name}</p>
              <p className="text-sm text-muted">
                {i.color.name} · {i.size}
              </p>
            </div>
            <p className="font-semibold tabular-nums">{formatPrice(i.price * i.quantity)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-6 space-y-2.5 border-t border-navy/10 pt-5 text-[0.9375rem]">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Shipping ({shippingLabel})</dt>
          <dd className="tabular-nums">{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Tax</dt>
          <dd className="tabular-nums">{formatPrice(totals.tax)}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-navy/10 pt-4">
          <dt className="font-semibold">Total</dt>
          <dd className="text-2xl font-bold tabular-nums">{formatPrice(totals.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
