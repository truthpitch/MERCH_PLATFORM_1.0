import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";

export default function NotFound() {
  return (
    <section className="container-tp flex min-h-[80dvh] flex-col items-start justify-center pt-[var(--tp-nav-h)]">
      <p className="eyebrow text-brown">404</p>
      <h1 className="mt-5 text-[clamp(3.25rem,10vw,9rem)] font-bold leading-[0.86] tracking-[-0.055em]">
        Straight answer:
        <br />
        <span className="text-accent">that page isn&apos;t here.</span>
      </h1>
      <p className="mt-6 max-w-md text-lg text-muted">It moved, sold out, or never existed. The shop definitely does.</p>
      <Button href="/shop" size="lg" className="mt-10" icon={<ArrowRightIcon size={18} />}>
        Go to the shop
      </Button>
    </section>
  );
}
