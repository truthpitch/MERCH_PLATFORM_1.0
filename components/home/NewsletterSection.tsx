import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Reveal } from "@/components/ui/Reveal";

export function NewsletterSection() {
  return (
    <section aria-labelledby="newsletter-title" className="pb-24 sm:pb-32">
      <div className="container-tp">
        <div className="relative overflow-hidden rounded-lg bg-accent px-6 py-16 text-white sm:px-12 sm:py-20 lg:px-20 surface-dark grain">
          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow text-sand">The list · 1 email a drop</p>
              <AnimatedText
                as="h2"
                id="newsletter-title"
                text={"Get the drop\nbefore it drops."}
                className="mt-5 text-5xl font-bold leading-[0.92] tracking-[-0.05em] sm:text-6xl lg:text-7xl"
              />
            </div>
            <Reveal className="lg:col-span-5" delay={0.15}>
              <p className="mb-6 text-lg text-white/85">
                Early access, restocks, and the occasional hard truth. Unsubscribe whenever — we&apos;ll take the hint.
              </p>
              <NewsletterForm tone="dark" />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
