import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ConfirmationCheck } from "@/components/checkout/ConfirmationCheck";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, GiftIcon } from "@/components/ui/Icons";
import { db } from "@/lib/db";
import { formatAddressLines } from "@/lib/orders";
import { getCurrentUser } from "@/lib/session";
import { isWithin } from "@/lib/time";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

function tokenMatches(given: unknown, expected: string) {
  if (typeof given !== "string" || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

export default async function OrderPage({ params, searchParams }: PageProps<"/orders/[number]">) {
  const [{ number }, { t }] = await Promise.all([params, searchParams]);
  const order = await db.order.findUnique({ where: { number }, include: { items: true, gift: true } });
  if (!order) notFound();

  // Who may see this: the link holder (token), the owning account, or an admin.
  const user = await getCurrentUser();
  const allowed =
    tokenMatches(t, order.accessToken) ||
    (user && (user.role === "ADMIN" || order.userId === user.id || (!order.userId && order.email === user.email)));
  if (!allowed) notFound();

  const fresh = isWithin(order.createdAt, 10 * 60_000);
  const shipTo = order.gift
    ? formatAddressLines({
        firstName: order.gift.recipientFirstName,
        lastName: order.gift.recipientLastName,
        line1: order.gift.recipientLine1,
        line2: order.gift.recipientLine2,
        city: order.gift.recipientCity,
        region: order.gift.recipientRegion,
        postalCode: order.gift.recipientPostalCode,
        country: order.gift.recipientCountry,
      })
    : formatAddressLines({
        firstName: order.shipFirstName,
        lastName: order.shipLastName,
        line1: order.shipLine1,
        line2: order.shipLine2,
        city: order.shipCity,
        region: order.shipRegion,
        postalCode: order.shipPostalCode,
        country: order.shipCountry,
      });

  return (
    <section className="container-tp pb-24 pt-[calc(var(--tp-nav-h)+3rem)] sm:pt-[calc(var(--tp-nav-h)+4.5rem)]">
      <div className="mx-auto max-w-3xl text-center">
        <ConfirmationCheck />
        <p className="eyebrow mt-8 text-brown">Order {order.number}</p>
        <h1 className="mt-3 text-[clamp(2.75rem,8vw,5.5rem)] font-bold leading-[0.9] tracking-[-0.05em]">
          {fresh ? "Done. No fine print." : "Your order."}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-muted">
          {fresh ? (
            <>
              Confirmation is on its way to <strong className="text-navy">{order.email}</strong>. We print to order, so expect tracking in 2–4 days.
            </>
          ) : (
            <>
              Placed {order.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} ·{" "}
              <StatusBadge status={order.status} kind="order" className="align-middle" />
            </>
          )}
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-soft">
          <p className="eyebrow text-muted">{order.isGift ? "Shipping to (gift)" : "Shipping to"}</p>
          <p className="mt-3 whitespace-pre-line font-medium">{shipTo}</p>
          <p className="mt-3 text-sm text-muted">{order.shippingMethod} delivery</p>
          {fresh && <StatusBadge status={order.status} kind="order" className="mt-4" />}
        </div>
        <div className="rounded-lg bg-white p-6 shadow-soft">
          <p className="eyebrow text-muted">Summary</p>
          <ul className="mt-3 space-y-3 text-sm">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-center gap-3">
                <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-sand-200">
                  <Image src={i.imageUrl} alt="" fill sizes="40px" unoptimized={i.imageUrl.endsWith(".svg")} className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  {i.quantity}× {i.name}
                  <span className="block text-muted">
                    {i.colorName}, {i.size}
                    {i.designerName !== "TruthPitch" && ` · by ${i.designerName}`}
                  </span>
                </span>
                <span className="tabular-nums">{formatPrice((i.unitPriceCents * i.quantity) / 100)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t border-navy/10 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(order.subtotalCents / 100)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="tabular-nums">{order.shippingCents === 0 ? "Free" : formatPrice(order.shippingCents / 100)}</dd>
            </div>
            <div className="flex justify-between pt-1 text-base font-bold">
              <dt>Total paid</dt>
              <dd className="tabular-nums">{formatPrice(order.totalCents / 100)}</dd>
            </div>
          </dl>
        </div>
        {order.gift?.message && (
          <div className="rounded-lg bg-sand-200 p-6 sm:col-span-2">
            <p className="eyebrow flex items-center gap-2 text-brown">
              <GiftIcon size={16} /> Gift note{order.gift.hidePrices && " · prices hidden on the packing slip"}
            </p>
            <p className="mt-3 text-xl font-semibold tracking-tight">“{order.gift.message}”</p>
          </div>
        )}
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Button href="/shop" size="lg" magnetic icon={<ArrowRightIcon size={18} />}>
          Keep shopping
        </Button>
        {user ? (
          <Button href="/dashboard/orders" size="lg" variant="outline">
            My orders
          </Button>
        ) : (
          <Button href={`/sign-up?callbackUrl=/dashboard/orders`} size="lg" variant="outline">
            Create an account to track it
          </Button>
        )}
      </div>
    </section>
  );
}
