"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { AddressFields } from "@/components/checkout/AddressFields";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Switch, Textarea } from "@/components/ui/Field";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, GiftIcon, LockIcon } from "@/components/ui/Icons";
import { scrollToTop } from "@/lib/lenis";
import { EASE_OUT } from "@/lib/motion";
import { computeTotals, SHIPPING_METHODS, shippingCost } from "@/lib/pricing";
import { contactStepSchema, shippingStepSchema, type ContactStepInput, type ShippingStepInput } from "@/lib/schemas";
import { cn, formatPrice } from "@/lib/utils";
import { selectSubtotal, useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import type { Address, Order, OrderDraft, ShippingMethodId } from "@/types";

const STEPS = ["Contact", "Shipping", "Payment", "Confirmation"] as const;

const emptyAddress = { firstName: "", lastName: "", line1: "", line2: "", city: "", region: "", postalCode: "", country: "US" };

export function CheckoutFlow() {
  const hydrated = useUi((s) => s.cartHydrated);
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const clearCart = useCart((s) => s.clear);

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [contact, setContact] = useState<ContactStepInput | null>(null);
  const [shipping, setShipping] = useState<ShippingStepInput | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  // After the outgoing step has animated away: scroll up and move focus to
  // the new step heading (keyboard / screen reader users).
  const onStepEntered = () => {
    requestAnimationFrame(() => {
      scrollToTop(false);
      headingRef.current?.focus({ preventScroll: true });
    });
  };

  const method: ShippingMethodId = shipping?.shippingMethod ?? "standard";
  const totals = order?.totals ?? computeTotals(subtotal, method);

  const placeOrder = async () => {
    if (!contact || !shipping) return;
    setPlacing(true);
    setPlaceError(null);
    const draft: OrderDraft = {
      contact: { email: contact.email, phone: contact.phone || undefined, marketingOptIn: contact.marketingOptIn },
      billingAddress: shipping.billingAddress,
      isGift: shipping.isGift,
      gift:
        shipping.isGift && shipping.gift
          ? { recipient: shipping.gift.recipient as Address, message: shipping.gift.message.trim(), hidePrices: shipping.gift.hidePrices }
          : null,
      shippingMethod: shipping.shippingMethod,
      items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
    };
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as { ok: boolean; order?: Order; error?: string };
      if (!res.ok || !data.order) throw new Error(data.error || "Something went wrong.");
      setOrder(data.order);
      clearCart();
      go(3);
    } catch (e) {
      setPlaceError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPlacing(false);
    }
  };

  if (!hydrated) {
    return <div className="container-tp h-96 animate-pulse rounded-lg bg-navy/5" aria-busy="true" />;
  }

  if (items.length === 0 && !order) {
    return (
      <div className="container-tp pb-24">
        <div className="rounded-lg border border-dashed border-navy/20 px-6 py-20 text-center">
          <p className="text-3xl font-bold tracking-tight">Nothing to check out.</p>
          <p className="mt-2 text-muted">Your cart is empty. Find something worth saying first.</p>
          <Button href="/shop" size="lg" className="mt-8" icon={<ArrowRightIcon size={18} />}>
            Shop the drop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-tp pb-24 sm:pb-32">
      <Stepper step={step} />

      <div className={cn("mt-10 grid gap-12", step < 3 && "lg:grid-cols-12")}>
        <div className={cn(step < 3 ? "lg:col-span-7" : "mx-auto w-full max-w-3xl")}>
          <AnimatePresence mode="wait" custom={dir} initial={false} onExitComplete={onStepEntered}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
            >
              {step === 0 && (
                <ContactStep
                  headingRef={headingRef}
                  defaultValues={contact}
                  onSubmit={(v) => {
                    setContact(v);
                    go(1);
                  }}
                />
              )}
              {step === 1 && (
                <ShippingStep
                  headingRef={headingRef}
                  defaultValues={shipping}
                  subtotal={subtotal}
                  onBack={() => go(0)}
                  onSubmit={(v) => {
                    setShipping(v);
                    go(2);
                  }}
                />
              )}
              {step === 2 && contact && shipping && (
                <PaymentStep
                  headingRef={headingRef}
                  contact={contact}
                  shipping={shipping}
                  total={totals.total}
                  placing={placing}
                  error={placeError}
                  onBack={() => go(1)}
                  onEdit={(s) => go(s)}
                  onPlace={placeOrder}
                />
              )}
              {step === 3 && order && <Confirmation headingRef={headingRef} order={order} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {step < 3 && (
          <aside aria-label="Order summary" className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <OrderSummary items={items} totals={totals} shippingLabel={SHIPPING_METHODS[method].label} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Stepper({ step }: { step: number }) {
  return (
    <nav aria-label="Checkout progress">
      <ol className="relative grid grid-cols-4 gap-2">
        {STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={label} aria-current={current ? "step" : undefined} className="flex flex-col gap-3">
              <div className="h-1 overflow-hidden rounded-full bg-navy/10">
                <motion.div
                  className="h-full origin-left bg-accent"
                  initial={false}
                  animate={{ scaleX: done || current ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: EASE_OUT }}
                />
              </div>
              <span className={cn("flex items-center gap-2 text-xs font-semibold sm:text-sm", current ? "text-navy" : done ? "text-accent" : "text-muted")}>
                <span
                  className={cn(
                    "hidden h-6 w-6 items-center justify-center rounded-full text-xs sm:inline-flex",
                    done ? "bg-accent text-white" : current ? "bg-navy text-white" : "bg-navy/10",
                  )}
                >
                  {done ? <CheckIcon size={14} /> : i + 1}
                </span>
                {label}
                {done && <span className="sr-only">(completed)</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

type HeadingRef = React.RefObject<HTMLHeadingElement | null>;

function StepHeading({ headingRef, title, sub }: { headingRef: HeadingRef; title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-[-0.03em] outline-none sm:text-4xl">
        {title}
      </h2>
      {sub && <p className="mt-2 text-muted">{sub}</p>}
    </div>
  );
}

function ContactStep({
  headingRef,
  defaultValues,
  onSubmit,
}: {
  headingRef: HeadingRef;
  defaultValues: ContactStepInput | null;
  onSubmit: (v: ContactStepInput) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactStepInput>({
    resolver: zodResolver(contactStepSchema),
    defaultValues: defaultValues ?? { email: "", phone: "", marketingOptIn: false },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <StepHeading headingRef={headingRef} title="Who's this for?" sub="We'll send your receipt and tracking here. Nothing else unless you say so." />
      <div className="grid gap-5">
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input label="Phone" type="tel" optional autoComplete="tel" hint="Only used if the courier needs to reach you." error={errors.phone?.message} {...register("phone")} />
        <Checkbox label="Email me about new drops" description="One email per drop. Unsubscribe anytime." {...register("marketingOptIn")} />
      </div>
      <div className="mt-10 flex items-center justify-between gap-4">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-navy">
          <ArrowLeftIcon size={16} /> Back to cart
        </Link>
        <Button type="submit" size="lg" icon={<ArrowRightIcon size={18} />}>
          Continue to shipping
        </Button>
      </div>
    </form>
  );
}

function ShippingStep({
  headingRef,
  defaultValues,
  subtotal,
  onBack,
  onSubmit,
}: {
  headingRef: HeadingRef;
  defaultValues: ShippingStepInput | null;
  subtotal: number;
  onBack: () => void;
  onSubmit: (v: ShippingStepInput) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ShippingStepInput>({
    resolver: zodResolver(shippingStepSchema),
    defaultValues: defaultValues ?? {
      billingAddress: emptyAddress,
      shippingMethod: "standard",
      isGift: false,
      gift: { recipient: emptyAddress, message: "", hidePrices: true },
    },
  });

  const isGift = useWatch({ control, name: "isGift" });
  const message = useWatch({ control, name: "gift.message" }) ?? "";
  const giftErrors = errors.gift;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <StepHeading headingRef={headingRef} title="Where's it going?" />

      <fieldset>
        <legend className="mb-4 text-lg font-bold">{isGift ? "Your details (billing)" : "Shipping address"}</legend>
        <AddressFields prefix="billingAddress" section="billing" register={register} errors={errors.billingAddress} />
      </fieldset>

      <div className="mt-8">
        <Switch
          label="This is a gift"
          description="Ship to someone else and add a note. We'll keep it a surprise."
          icon={<GiftIcon />}
          {...register("isGift")}
        />
      </div>

      <AnimatePresence initial={false}>
        {isGift && (
          <motion.div
            key="gift"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="mt-6 space-y-6 rounded-lg border border-sand bg-sand-200/50 p-5 sm:p-6"
          >
            <fieldset>
              <legend className="mb-4 text-lg font-bold">Recipient&apos;s address</legend>
              <AddressFields prefix="gift.recipient" section="shipping" register={register} errors={giftErrors?.recipient as never} />
            </fieldset>
            <Textarea
              label="Gift message"
              optional
              maxLength={300}
              placeholder="Say it straight. We'll print it on a card in the box."
              hint={`${message.length}/300`}
              error={giftErrors?.message?.message}
              {...register("gift.message")}
            />
            <Checkbox label="Hide prices on the packing slip" {...register("gift.hidePrices")} />
          </motion.div>
        )}
      </AnimatePresence>

      <fieldset className="mt-10">
        <legend className="mb-4 text-lg font-bold">Delivery</legend>
        <div className="grid gap-3">
          {(Object.values(SHIPPING_METHODS) as (typeof SHIPPING_METHODS)[ShippingMethodId][]).map((m) => {
            const cost = shippingCost(subtotal, m.id);
            return (
              <label
                key={m.id}
                className="flex cursor-pointer items-center gap-4 rounded-lg border border-navy/15 bg-white p-4 transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent/5"
              >
                <input type="radio" value={m.id} className="h-5 w-5 accent-[var(--tp-accent)]" {...register("shippingMethod")} />
                <span className="flex-1">
                  <span className="block font-semibold">{m.label}</span>
                  <span className="block text-sm text-muted">{m.description}</span>
                </span>
                <span className="font-semibold tabular-nums">{cost === 0 ? "Free" : formatPrice(cost)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-10 flex items-center justify-between gap-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-navy">
          <ArrowLeftIcon size={16} /> Contact
        </button>
        <Button type="submit" size="lg" icon={<ArrowRightIcon size={18} />}>
          Continue to payment
        </Button>
      </div>
    </form>
  );
}

function formatAddress(a: Partial<Address>) {
  return [`${a.firstName ?? ""} ${a.lastName ?? ""}`.trim(), a.line1, a.line2, `${a.city ?? ""}, ${a.region ?? ""} ${a.postalCode ?? ""}`, a.country]
    .filter((x) => x && String(x).trim() && String(x).trim() !== ",")
    .join("\n");
}

function PaymentStep({
  headingRef,
  contact,
  shipping,
  total,
  placing,
  error,
  onBack,
  onEdit,
  onPlace,
}: {
  headingRef: HeadingRef;
  contact: ContactStepInput;
  shipping: ShippingStepInput;
  total: number;
  placing: boolean;
  error: string | null;
  onBack: () => void;
  onEdit: (step: number) => void;
  onPlace: () => void;
}) {
  const shipTo = shipping.isGift && shipping.gift ? shipping.gift.recipient : shipping.billingAddress;
  return (
    <div>
      <StepHeading headingRef={headingRef} title="Last check. Then it's yours." />

      <dl className="divide-y divide-navy/10 rounded-lg border border-navy/10 bg-white">
        {[
          { label: "Contact", value: contact.email, step: 0 },
          { label: shipping.isGift ? "Ship to (gift)" : "Ship to", value: formatAddress(shipTo), step: 1 },
          { label: "Delivery", value: SHIPPING_METHODS[shipping.shippingMethod].label, step: 1 },
          ...(shipping.isGift && shipping.gift?.message ? [{ label: "Gift note", value: `“${shipping.gift.message}”`, step: 1 }] : []),
        ].map((row) => (
          <div key={row.label} className="flex items-start gap-4 p-4 sm:p-5">
            <dt className="w-28 shrink-0 text-sm text-muted">{row.label}</dt>
            <dd className="flex-1 whitespace-pre-line text-sm font-medium">{row.value}</dd>
            <button type="button" onClick={() => onEdit(row.step)} className="text-sm font-medium text-accent underline-offset-4 hover:underline">
              Edit<span className="sr-only"> {row.label.toLowerCase()}</span>
            </button>
          </div>
        ))}
      </dl>

      <section aria-labelledby="payment-title" className="mt-10">
        <h3 id="payment-title" className="mb-4 flex items-center gap-2 text-lg font-bold">
          <LockIcon size={18} /> Payment
        </h3>
        {/* Phase 2: mount Stripe's Payment Element here using the client_secret from /api/orders. */}
        <div className="rounded-lg border-2 border-dashed border-navy/20 bg-white p-6 text-center">
          <p className="font-semibold">Payment is in demo mode.</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Card payments (Stripe) plug in here. No card needed — placing this order runs the full flow with a mock payment.
          </p>
          <div aria-hidden className="mx-auto mt-5 grid max-w-sm gap-2 opacity-50">
            <div className="h-11 rounded-md border border-navy/15 bg-paper" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-11 rounded-md border border-navy/15 bg-paper" />
              <div className="h-11 rounded-md border border-navy/15 bg-paper" />
            </div>
          </div>
        </div>
      </section>

      {error && (
        <p role="alert" className="mt-6 rounded-md bg-[#b42318]/10 p-4 text-sm font-medium text-[#b42318]">
          {error}
        </p>
      )}

      <div className="mt-10 flex items-center justify-between gap-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-navy">
          <ArrowLeftIcon size={16} /> Shipping
        </button>
        <Button size="lg" onClick={onPlace} disabled={placing} icon={placing ? undefined : <ArrowRightIcon size={18} />}>
          {placing ? "Placing order…" : `Place order · ${formatPrice(total)}`}
        </Button>
      </div>
    </div>
  );
}

function Confirmation({ headingRef, order }: { headingRef: HeadingRef; order: Order }) {
  return (
    <div className="text-center">
      <motion.span
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
        className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-accent text-white"
      >
        <CheckIcon size={36} />
      </motion.span>
      <p className="eyebrow mt-8 text-brown">Order {order.number}</p>
      <h2 ref={headingRef} tabIndex={-1} className="mt-3 text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[0.9] tracking-[-0.05em] outline-none">
        Done. No fine print.
      </h2>
      <p className="mx-auto mt-5 max-w-md text-lg text-muted">
        Confirmation is on its way to <strong className="text-navy">{order.contact.email}</strong>. We print to order, so expect tracking in 2–4 days.
      </p>

      <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-soft">
          <p className="eyebrow text-muted">{order.isGift ? "Shipping to (gift)" : "Shipping to"}</p>
          <p className="mt-3 whitespace-pre-line font-medium">{formatAddress(order.shippingAddress)}</p>
          <p className="mt-3 text-sm text-muted">{order.shippingMethod.label} delivery</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-soft">
          <p className="eyebrow text-muted">Summary</p>
          <ul className="mt-3 space-y-1 text-sm">
            {order.items.map((i) => (
              <li key={i.variantId} className="flex justify-between gap-3">
                <span>
                  {i.quantity}× {i.name} <span className="text-muted">({i.color.name}, {i.size})</span>
                </span>
                <span className="tabular-nums">{formatPrice(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-navy/10 pt-3 font-bold">
            <span>Total paid</span>
            <span className="tabular-nums">{formatPrice(order.totals.total)}</span>
          </p>
        </div>
        {order.isGift && order.gift?.message && (
          <div className="rounded-lg bg-sand-200 p-6 sm:col-span-2">
            <p className="eyebrow flex items-center gap-2 text-brown">
              <GiftIcon size={16} /> Your gift note
            </p>
            <p className="mt-3 text-xl font-semibold tracking-tight">“{order.gift.message}”</p>
          </div>
        )}
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Button href="/shop" size="lg" magnetic icon={<ArrowRightIcon size={18} />}>
          Keep shopping
        </Button>
        <Button href="/" size="lg" variant="outline">
          Back home
        </Button>
      </div>
    </div>
  );
}
