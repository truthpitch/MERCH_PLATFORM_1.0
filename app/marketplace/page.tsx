import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { PageHeader } from "@/components/shop/PageHeader";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { isProductType, PRODUCT_TYPE_SPECS, STUDIO_PRODUCT_TYPES } from "@/lib/catalog";
import { getMarketplaceCreators, getProducts } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { ProductSort, ProductTypeId } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Community designs, hand-approved by TruthPitch. Real messages from real people — printed on heavyweight goods.",
  alternates: { canonical: "/marketplace" },
  openGraph: { title: "Marketplace — TruthPitch", url: "/marketplace" },
};

const SORTS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
];

function href(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
  return qs ? `/marketplace?${qs}` : "/marketplace";
}

function Pill({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={to}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
        active ? "border-navy bg-navy text-white" : "border-navy/15 bg-white hover:border-navy",
      )}
    >
      {children}
    </Link>
  );
}

export default async function MarketplacePage({ searchParams }: PageProps<"/marketplace">) {
  const sp = await searchParams;
  const type: ProductTypeId | undefined = isProductType(sp.type) ? sp.type : undefined;
  const sort: ProductSort = sp.sort === "popular" ? "popular" : "newest";
  const creator = typeof sp.creator === "string" ? sp.creator : undefined;

  const [products, creators, all] = await Promise.all([
    getProducts({ community: true, productType: type ?? null, creatorUsername: creator, sort }),
    getMarketplaceCreators(),
    getProducts({ community: true }),
  ]);
  const current = { type, sort: sort === "newest" ? undefined : sort, creator };
  const activeCreator = creators.find((c) => c.username === creator);

  return (
    <>
      <PageHeader
        eyebrow={`${all.length} community designs · Hand-approved`}
        title={"Made by people\nwho mean it."}
        highlight={["mean", "it."]}
        description="Every design here was made by someone in the TruthPitch community and approved by hand. Same heavyweight blanks, their message."
      />

      <div className="container-tp pb-24 sm:pb-32">
        <div className="flex flex-col gap-4 border-b border-navy/10 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav aria-label="Product type" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <Pill to={href({ ...current, type: undefined })} active={!type}>
                All
              </Pill>
              {STUDIO_PRODUCT_TYPES.map((t) => (
                <Pill key={t} to={href({ ...current, type: t })} active={type === t}>
                  {PRODUCT_TYPE_SPECS[t].plural}
                </Pill>
              ))}
            </nav>
            <nav aria-label="Sort" className="flex gap-2">
              {SORTS.map((s) => (
                <Pill key={s.value} to={href({ ...current, sort: s.value === "newest" ? undefined : s.value })} active={sort === s.value}>
                  {s.label}
                </Pill>
              ))}
            </nav>
          </div>
          {creators.length > 0 && (
            <nav aria-label="Creators" className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <span className="eyebrow mr-2 shrink-0 text-muted">Creator</span>
              <Pill to={href({ ...current, creator: undefined })} active={!creator}>
                Everyone
              </Pill>
              {creators.map((c) => (
                <Pill key={c.username} to={href({ ...current, creator: c.username })} active={creator === c.username}>
                  {c.name} <span className="text-xs opacity-60">{c.count}</span>
                </Pill>
              ))}
            </nav>
          )}
        </div>

        <p className="mt-6 text-sm text-muted" aria-live="polite">
          <span className="font-semibold text-navy tabular-nums">{products.length}</span> {products.length === 1 ? "design" : "designs"}
          {activeCreator && (
            <>
              {" "}
              by{" "}
              <Link href={`/creators/${activeCreator.username}`} className="font-semibold text-navy underline-offset-4 hover:underline">
                {activeCreator.name}
              </Link>
            </>
          )}
        </p>

        {products.length > 0 ? (
          <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p, i) => (
              <Reveal as="li" key={p.id} delay={Math.min(i, 8) * 0.05}>
                <ProductCard product={p} priority={i < 4} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <div className="mt-12 rounded-lg border border-dashed border-navy/20 px-6 py-20 text-center">
            <p className="text-3xl font-bold tracking-tight">{all.length ? "Nothing matches. Honestly." : "The marketplace is warming up."}</p>
            <p className="mx-auto mt-3 max-w-md text-muted">
              {all.length ? "Try another product type or creator." : "Community designs land here once they're approved. Yours could be first."}
            </p>
            <Button href={all.length ? "/marketplace" : "/studio"} variant="outline" className="mt-8">
              {all.length ? "Clear filters" : "Open the studio"}
            </Button>
          </div>
        )}

        <section aria-labelledby="create-cta" className="surface-dark relative mt-24 overflow-hidden rounded-lg bg-navy px-6 py-16 text-white grain sm:px-12 lg:px-16">
          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="eyebrow text-sand">Design studio</p>
              <AnimatedText as="h2" id="create-cta" text={"Got something\nto say?"} className="mt-4 text-5xl font-bold leading-[0.9] tracking-[-0.05em] sm:text-7xl" />
            </div>
            <div className="lg:col-span-4">
              <p className="mb-6 text-white/80">Upload your artwork, place it on a tee, hoodie or cap, and submit it for review. Approved designs go live here.</p>
              <Button href="/studio" variant="light" size="lg" magnetic icon={<ArrowRightIcon size={18} />}>
                Start designing
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
