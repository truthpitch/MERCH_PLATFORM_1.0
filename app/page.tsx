import type { Metadata } from "next";
import { BestSellers } from "@/components/home/BestSellers";
import { Community } from "@/components/home/Community";
import { Hero } from "@/components/home/Hero";
import { LatestDrop } from "@/components/home/LatestDrop";
import { Manifesto } from "@/components/home/Manifesto";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { Preloader } from "@/components/home/Preloader";
import { StoryTeaser } from "@/components/home/StoryTeaser";
import { JsonLd } from "@/components/seo/JsonLd";
import { Marquee } from "@/components/ui/Marquee";
import { getBestSellers, getLatestDrop } from "@/lib/products";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

// Reads live catalog data from the database.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "TruthPitch — Say it straight. Merch that means it." },
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [drop, bestSellers] = await Promise.all([getLatestDrop(6), getBestSellers(4)]);

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <Preloader />
      <Hero />
      <Marquee
        items={siteConfig.slogans}
        className="border-y border-navy/10 bg-paper py-5 sm:py-7"
        itemClassName="text-3xl font-bold tracking-[-0.04em] sm:text-5xl"
      />
      <LatestDrop products={drop} />
      <Manifesto />
      <Marquee
        items={siteConfig.slogans}
        reverse
        duration={40}
        className="bg-brown py-4 text-sand"
        itemClassName="text-xl font-semibold uppercase tracking-[0.08em] sm:text-2xl"
      />
      <BestSellers products={bestSellers} />
      <StoryTeaser />
      <Community />
      <NewsletterSection />
    </>
  );
}
