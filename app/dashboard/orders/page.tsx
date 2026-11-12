import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, GiftIcon } from "@/components/ui/Icons";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "My orders" };

export default async function MyOrdersPage() {
  const user = await requireUser("/dashboard/orders");
  // Includes guest orders placed with the same email before signing up.
  const orders = await db.order.findMany({
    where: { OR: [{ userId: user.id }, { userId: null, email: user.email }] },
    orderBy: { createdAt: "desc" },
    include: { items: true, gift: { select: { recipientFirstName: true } } },
    take: 50,
  });

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-navy/20 px-6 py-20 text-center">
        <p className="text-3xl font-bold tracking-tight">No orders yet.</p>
        <p className="mx-auto mt-3 max-w-md text-muted">When you order something, it shows up here with tracking — even if you checked out as a guest with this email.</p>
        <Button href="/shop" size="lg" className="mt-8" icon={<ArrowRightIcon size={18} />}>
          Shop the drop
        </Button>
      </div>
    );
  }

  return (
    <ul className="grid gap-4">
      {orders.map((o) => (
        <li key={o.id}>
          <Link
            href={`/orders/${o.number}`}
            className="group flex flex-col gap-4 rounded-lg border border-navy/10 bg-white p-5 transition-colors hover:border-navy/30 sm:flex-row sm:items-center"
          >
            <div className="flex -space-x-4">
              {o.items.slice(0, 3).map((i) => (
                <span key={i.id} className="relative h-16 w-14 overflow-hidden rounded-md border-2 border-white bg-sand-200">
                  <Image src={i.imageUrl} alt="" fill sizes="56px" unoptimized={i.imageUrl.endsWith(".svg")} className="object-cover" />
                </span>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-lg font-bold">{o.number}</p>
                <StatusBadge status={o.status} kind="order" />
                {o.isGift && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brown">
                    <GiftIcon size={14} /> Gift{o.gift ? ` for ${o.gift.recipientFirstName}` : ""}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted">
                {o.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} ·{" "}
                {o.items.reduce((n, i) => n + i.quantity, 0)} item(s)
              </p>
            </div>
            <p className="text-lg font-bold tabular-nums">{formatPrice(o.totalCents / 100)}</p>
            <ArrowRightIcon className="hidden transition-transform group-hover:translate-x-1 sm:block" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
