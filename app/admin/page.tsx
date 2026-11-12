import Link from "next/link";
import { DesignThumb } from "@/components/dashboard/DesignThumb";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { daysAgo } from "@/lib/time";
import { formatPrice } from "@/lib/utils";
import type { ProductTypeId } from "@/types";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const since = daysAgo(30);
  const [pending, live, creators, users, orders30, revenue30, queue, recentOrders] = await Promise.all([
    db.design.count({ where: { status: "PENDING" } }),
    db.design.count({ where: { status: "APPROVED" } }),
    db.user.count({ where: { role: "USER", designs: { some: { status: "APPROVED" } } } }),
    db.user.count(),
    db.order.count({ where: { createdAt: { gte: since }, status: { not: "CANCELLED" } } }),
    db.order.aggregate({ _sum: { totalCents: true }, where: { createdAt: { gte: since }, status: { not: "CANCELLED" } } }),
    db.design.findMany({
      where: { status: "PENDING" },
      orderBy: { submittedAt: "asc" },
      take: 5,
      include: { creator: { select: { name: true, username: true } }, variants: { select: { productType: true }, take: 1 } },
    }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const stats = [
    { label: "Waiting for review", value: pending, href: "/admin/designs", highlight: pending > 0 },
    { label: "Live designs", value: live, href: "/admin/designs?status=APPROVED" },
    { label: "Active creators", value: creators, href: "/admin/users" },
    { label: "Accounts", value: users, href: "/admin/users" },
    { label: "Orders (30 days)", value: orders30, href: "/admin/orders" },
    { label: "Revenue (30 days)", value: formatPrice((revenue30._sum.totalCents ?? 0) / 100), href: "/admin/orders" },
  ];

  return (
    <div className="grid gap-12">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`rounded-lg border p-5 transition-colors hover:border-navy/40 ${s.highlight ? "border-accent bg-accent/5" : "border-navy/10 bg-white"}`}
          >
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="mt-1 text-3xl font-bold tabular-nums">{s.value}</dd>
          </Link>
        ))}
      </dl>

      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="queue-title">
          <div className="flex items-center justify-between">
            <h2 id="queue-title" className="text-2xl font-bold tracking-tight">
              Oldest in the queue
            </h2>
            <Link href="/admin/designs" className="text-sm font-semibold text-accent underline-offset-4 hover:underline">
              Full queue
            </Link>
          </div>
          {queue.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-navy/20 p-10 text-center text-muted">Queue&apos;s empty. Nothing to judge.</p>
          ) : (
            <ul className="mt-6 grid gap-3">
              {queue.map((d) => (
                <li key={d.id}>
                  <Link href={`/admin/designs/${d.id}`} className="flex items-center gap-4 rounded-lg border border-navy/10 bg-white p-3 hover:border-navy/30">
                    <DesignThumb
                      imageUrl={d.imageUrl}
                      type={d.variants[0]?.productType as ProductTypeId | undefined}
                      placement={{ x: d.placementX, y: d.placementY, scale: d.placementScale }}
                      community
                      className="w-16 shrink-0 rounded-md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{d.title}</p>
                      <p className="text-sm text-muted">
                        by {d.creator.name ?? d.creator.username} · {d.submittedAt?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <ArrowRightIcon size={18} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="orders-title">
          <div className="flex items-center justify-between">
            <h2 id="orders-title" className="text-2xl font-bold tracking-tight">
              Latest orders
            </h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-accent underline-offset-4 hover:underline">
              All orders
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-navy/20 p-10 text-center text-muted">
              No orders yet.
              <div className="mt-4">
                <Button href="/shop" size="sm" variant="outline">
                  Visit the shop
                </Button>
              </div>
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-navy/10 rounded-lg border border-navy/10 bg-white">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <Link href={`/orders/${o.number}`} className="font-semibold hover:text-accent">
                      {o.number}
                    </Link>
                    <p className="truncate text-sm text-muted">{o.email}</p>
                  </div>
                  <StatusBadge status={o.status} kind="order" />
                  <p className="font-semibold tabular-nums">{formatPrice(o.totalCents / 100)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
