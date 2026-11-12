import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageHeader } from "@/components/shop/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Accordion } from "@/components/ui/Accordion";
import { ArrowUpRightIcon, socialIcons } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FREE_SHIPPING_THRESHOLD, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about an order, sizing, or a collab? Talk to a real person at TruthPitch.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact — TruthPitch", url: "/contact" },
};

const FAQ = [
  {
    group: "Shipping",
    items: [
      {
        q: "How long does shipping take?",
        a: `Everything is printed to order, which takes 2–4 business days. Then Standard arrives in 5–8 business days and Express in 2–3. Standard shipping is free over $${FREE_SHIPPING_THRESHOLD}.`,
      },
      { q: "Do you ship internationally?", a: "Yes — to the US, Canada, the UK, Ireland, Australia, New Zealand and most of the EU. Duties may apply at delivery outside the US." },
      { q: "Can I send an order as a gift?", a: "Yes. Switch on “This is a gift” at checkout to ship to a different address, add a note, and hide prices on the packing slip." },
    ],
  },
  {
    group: "Returns",
    items: [
      { q: "What's your returns policy?", a: "Unworn items can be returned within 30 days for a refund, minus original shipping. Start a return by replying to your order email." },
      { q: "Can I exchange for a different size?", a: "Exchanges are free within 30 days. We'll send a prepaid label and print your new size as soon as the original is on its way back." },
      { q: "My order arrived damaged or wrong.", a: "That's on us. Send a photo within 14 days and we'll reprint and reship it at no cost — no need to send the original back." },
    ],
  },
  {
    group: "Sizing",
    items: [
      { q: "How do your tees fit?", a: "Our tees are boxy with a dropped shoulder. If you prefer a regular fit, size down. Every product page has a size guide with exact measurements." },
      { q: "Do hoodies shrink?", a: "Our fleece is pre-shrunk, so expect less than 3% after washing. Wash cold and hang dry to keep the print sharp for years." },
    ],
  },
];

export default function ContactPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.flatMap((g) => g.items).map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <PageHeader
        eyebrow="Contact"
        title={"Say it\nto us."}
        highlight={["us."]}
        description="Order question, sizing doubt, collab idea, or just a hard truth for us? A real person reads every message."
      />

      <section className="container-tp grid gap-12 pb-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
        <aside aria-label="Other ways to reach us" className="space-y-10 lg:col-span-4 lg:col-start-9">
          <Reveal>
            <h2 className="eyebrow text-brown">Email</h2>
            <a href={`mailto:${siteConfig.email}`} className="mt-3 inline-block text-2xl font-bold tracking-tight hover:text-accent">
              {siteConfig.email}
            </a>
            <p className="mt-2 text-sm text-muted">Replies within 2 business days, Mon–Fri.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="eyebrow text-brown">Social</h2>
            <ul className="mt-4 divide-y divide-navy/10 border-y border-navy/10">
              {siteConfig.socials.map((s) => {
                const Icon = socialIcons[s.label];
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between py-4 font-semibold"
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={20} /> {s.label}
                        <span className="text-sm font-normal text-muted">{s.handle}</span>
                      </span>
                      <ArrowUpRightIcon size={18} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      <span className="sr-only">(opens in new tab)</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </aside>
      </section>

      <section id="faq" tabIndex={-1} aria-labelledby="faq-title" className="scroll-mt-24 bg-sand-200 py-24 outline-none sm:py-32">
        <div className="container-tp grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading id="faq-title" eyebrow="FAQ" title="Straight answers." highlight={["answers."]} />
          </div>
          <div className="space-y-12 lg:col-span-7 lg:col-start-6">
            {FAQ.map((g) => (
              <div key={g.group}>
                <h3 className="eyebrow mb-2 text-brown">{g.group}</h3>
                <Accordion items={g.items.map((i) => ({ question: i.q, answer: i.a }))} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
