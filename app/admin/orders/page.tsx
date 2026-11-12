import type { Metadata } from "next";
import Link from "next/link";
import { RefreshFulfillmentButton } from "@/components/admin/AdminControls";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { GiftIcon } from "@/components/ui/Icons";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      items: { select: { quantity: true, name: true } },
      gift: { select: { recipientFirstName: true, recipientLastName: true } },
      user: { select: { username: true } },
    },
  });

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-navy/20 px-6 py-20 text-center">
        <p className="text-3xl font-bold tracking-tight">No orders yet.</p>
        <p className="mt-2 text-muted">They&apos;ll show up here the moment someone checks out.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
      <table className="w-full min-w-[56rem] text-left text-sm">
        <caption className="sr-only">All orders, newest first</caption>
        <thead className="border-b border-navy/10 bg-paper">
          <tr>
            {["Order", "Customer", "Items", "Ship to", "Status", "Fulfillment", "Total"].map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/10">
          {orders.map((o) => (
            <tr key={o.id} className="align-top">
              <td className="px-4 py-3">
                <Link href={`/orders/${o.number}`} className="font-semibold hover:text-accent">
                  {o.number}
                </Link>
                <p className="text-xs text-muted">{o.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
              </td>
              <td className="px-4 py-3">
                <p className="max-w-48 truncate">{o.email}</p>
                <p className="text-xs text-muted">{o.user?.username ? `@${o.user.username}` : "Guest"}</p>
              </td>
              <td className="px-4 py-3">
                <p>{o.items.reduce((n, i) => n + i.quantity, 0)} item(s)</p>
                <p className="max-w-56 truncate text-xs text-muted">{o.items.map((i) => i.name).join(", ")}</p>
              </td>
              <td className="px-4 py-3">
                {o.isGift && o.gift ? (
                  <span className="inline-flex items-center gap-1 font-medium text-brown">
                    <GiftIcon size={14} /> {o.gift.recipientFirstName} {o.gift.recipientLastName}
                  </span>
                ) : (
                  <span>
                    {o.shipFirstName} {o.shipLastName}
                  </span>
                )}
                <p className="text-xs text-muted">{o.shippingMethod}</p>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={o.status} kind="order" />
              </td>
              <td className="px-4 py-3">
                <p className="text-xs">
                  {o.fulfillmentProvider} · {o.fulfillmentStatus ?? "—"}
                </p>
                {o.fulfillmentId && <RefreshFulfillmentButton orderId={o.id} />}
              </td>
              <td className="px-4 py-3 font-semibold tabular-nums">{formatPrice(o.totalCents / 100)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
