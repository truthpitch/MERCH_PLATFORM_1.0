import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { JsonLd } from "@/components/seo/JsonLd";
import { Accordion } from "@/components/ui/Accordion";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { LockIcon, TruckIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CATEGORY_LABELS } from "@/lib/filters";
import { getAllProductSlugs, getProductBySlug, getRelatedProducts } from "@/lib/products";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };
  const image = product.images[0];
  return {
    title: product.name,
    description: `${product.tagline} ${product.description}`,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title: `${product.name} — TruthPitch`,
      description: product.tagline,
      url: `/shop/${product.slug}`,
      images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }],
    },
    twitter: { card: "summary_large_image", images: [image.src] },
  };
}

export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product, 4);

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(product),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: product.name, path: `/shop/${product.slug}` },
          ]),
        ]}
      />

      <div className="container-tp pt-[calc(var(--tp-nav-h)+1.5rem)]">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-navy">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/shop?category=${product.category}`} className="hover:text-navy">
                {CATEGORY_LABELS[product.category]}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="font-medium text-navy">
              {product.name}
            </li>
          </ol>
        </nav>
      </div>

      <section className="container-tp grid gap-10 pb-20 pt-6 lg:grid-cols-12 lg:gap-14 lg:pb-28">
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div className="lg:col-span-5">
          <div className="flex flex-wrap items-center gap-2">
            {product.isNew && <span className="rounded-full bg-navy px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">New</span>}
            {product.isBestSeller && <span className="rounded-full bg-brown px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">Best seller</span>}
            <span className="text-sm text-muted">Design by {product.designer.name}</span>
          </div>

          <AnimatedText
            as="h1"
            text={product.name}
            play
            className="mt-5 text-5xl font-bold leading-[0.92] tracking-[-0.05em] sm:text-6xl"
          />
          <p className="mt-4 text-xl font-medium text-brown">{product.tagline}</p>

          <p className="mt-6 flex items-baseline gap-3 text-3xl font-bold tabular-nums">
            {product.compareAtPrice && (
              <span className="text-lg font-medium text-muted line-through">
                <span className="sr-only">Was </span>
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            <span>
              {product.compareAtPrice && <span className="sr-only">Now </span>}
              {formatPrice(product.price)}
            </span>
          </p>

          <p className="mt-6 text-navy/80">{product.description}</p>

          <div className="mt-10">
            <ProductPurchase product={product} />
          </div>

          <ul className="mt-8 grid gap-3 rounded-lg border border-navy/10 bg-white p-5 text-sm">
            <li className="flex items-center gap-3">
              <TruckIcon size={20} className="shrink-0 text-brown" />
              Free standard shipping over {formatPrice(FREE_SHIPPING_THRESHOLD, { whole: true })}. Printed to order in 2–4 days.
            </li>
            <li className="flex items-center gap-3">
              <LockIcon size={20} className="shrink-0 text-brown" />
              Secure checkout. Free exchanges within 30 days.
            </li>
          </ul>

          <Accordion
            className="mt-10"
            items={[
              {
                question: "Details & care",
                answer: (
                  <ul className="list-disc space-y-1 pl-5">
                    {product.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                ),
              },
              {
                question: "Shipping",
                answer: "Every piece is printed to order, then shipped tracked. Standard arrives in 5–8 business days; Express in 2–3 after printing.",
              },
              {
                question: "Returns & exchanges",
                answer: "Wrong size? Exchanges are free within 30 days. Changed your mind? Return unworn items within 30 days for a refund, minus shipping.",
              },
            ]}
          />
        </div>
      </section>

      {/* The story behind the design */}
      <section aria-labelledby="story-heading" className="surface-dark bg-navy py-24 text-white sm:py-32">
        <div className="container-tp grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow flex items-center gap-3 text-sand">
              <span aria-hidden className="inline-block h-px w-8 bg-current" />
              The message
            </p>
            <h2 id="story-heading" className="mt-5 text-3xl font-bold tracking-tight">
              The meaning behind the {product.name}.
            </h2>
          </div>
          <div className="lg:col-span-8">
            <AnimatedText
              as="p"
              text={`“${product.story}”`}
              stagger={0.02}
              className="text-[clamp(1.6rem,3.4vw,3rem)] font-bold leading-[1.12] tracking-[-0.03em]"
            />
            <Reveal delay={0.2}>
              <p className="mt-10 flex items-center gap-3 text-sand">
                <span aria-hidden className="inline-block h-px w-10 bg-current" />— {product.designer.name}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Related */}
      <section aria-labelledby="related-title" className="py-24 sm:py-32">
        <div className="container-tp">
          <SectionHeading id="related-title" eyebrow="Keep looking" title="Pairs well with." />
          <ul className="mt-14 grid grid-cols-1 gap-x-6 gap-y-12 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 0.08}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
