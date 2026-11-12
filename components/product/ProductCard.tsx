import Image from "next/image";
import Link from "next/link";
import { GarmentMockup } from "@/components/product/GarmentMockup";
import { PRODUCT_TYPE_SPECS } from "@/lib/catalog";
import { CATEGORY_LABELS } from "@/lib/filters";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Show an index number (Latest Drop rail) */
  index?: number;
  tone?: "light" | "dark";
}

/**
 * Product tile: second-angle image swap on hover, "View" cursor label,
 * badge for new / best sellers. Pure CSS hover (transform/opacity only).
 */
export function ProductCard({ product, sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw", priority, className, index, tone = "light" }: ProductCardProps) {
  const [primary, secondary] = product.images;
  const badge = product.isNew ? "New" : product.isBestSeller ? "Best seller" : null;
  const dark = tone === "dark";
  const mockup = product.mockup;
  const firstType = product.productTypes[0];
  const secondType = product.productTypes[1];
  const colorFor = (t: typeof firstType) => product.variants.find((v) => v.productType === t)?.color.hex ?? "#FFFFFF";
  const altColor = product.variants.find((v) => v.productType === firstType && v.color.hex !== colorFor(firstType))?.color.hex;
  const subtitle = product.productTypes.length > 1
    ? product.productTypes.map((t) => PRODUCT_TYPE_SPECS[t].label).join(" · ")
    : `${CATEGORY_LABELS[product.category]} · ${product.colors.length} ${product.colors.length === 1 ? "colour" : "colours"}`;

  return (
    <article className={cn("group/card relative", className)}>
      <Link href={`/shop/${product.slug}`} data-cursor="View" className="block rounded-lg">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-sand-200">
          {mockup && firstType ? (
            <>
              <GarmentMockup
                type={firstType}
                color={colorFor(firstType)}
                mockup={mockup}
                sizes={sizes}
                priority={priority}
                alt={primary.alt}
                className="absolute inset-0 transition-transform duration-[1.2s] ease-[var(--tp-ease-out)] group-hover/card:scale-[1.04]"
              />
              {(secondType || altColor) && (
                <div aria-hidden className="absolute inset-0 scale-[1.04] opacity-0 transition-[opacity,transform] duration-700 ease-[var(--tp-ease-out)] group-hover/card:scale-100 group-hover/card:opacity-100 group-focus-visible/card:opacity-100">
                  <GarmentMockup
                    type={secondType ?? firstType}
                    color={secondType ? colorFor(secondType) : altColor!}
                    mockup={mockup}
                    sizes={sizes}
                    className="absolute inset-0"
                  />
                </div>
              )}
            </>
          ) : (
            <Image
              src={primary.src}
              alt={primary.alt}
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover transition-transform duration-[1.2s] ease-[var(--tp-ease-out)] group-hover/card:scale-[1.04]"
            />
          )}
          {!mockup && secondary && (
            <Image
              src={secondary.src}
              alt=""
              aria-hidden
              fill
              sizes={sizes}
              className="scale-[1.08] object-cover opacity-0 transition-[opacity,transform] duration-700 ease-[var(--tp-ease-out)] group-hover/card:scale-100 group-hover/card:opacity-100 group-focus-visible/card:opacity-100"
            />
          )}
          {badge && (
            <span
              className={cn(
                "absolute left-3 top-3 rounded-full px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em]",
                product.isNew ? "bg-white text-navy" : "bg-brown text-white",
              )}
            >
              {badge}
            </span>
          )}
          {product.compareAtPrice && (
            <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white">
              Sale
            </span>
          )}
          {typeof index === "number" && (
            <span aria-hidden className="absolute bottom-3 left-4 text-6xl font-bold leading-none tracking-[-0.06em] text-white/90 mix-blend-difference">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold tracking-tight sm:text-lg">{product.name}</h3>
            <p className={cn("mt-0.5 text-sm", dark ? "text-white/65" : "text-muted")}>{subtitle}</p>
            {product.isCommunity && (
              <p className={cn("mt-1 text-sm font-medium", dark ? "text-sand" : "text-brown")}>by {product.designer.name}</p>
            )}
          </div>
          <p className="shrink-0 text-right font-semibold tabular-nums">
            {product.compareAtPrice && (
              <span className={cn("mr-2 text-sm font-normal line-through", dark ? "text-white/50" : "text-muted")}>
                <span className="sr-only">Was </span>
                {formatPrice(product.compareAtPrice, { whole: true })}
              </span>
            )}
            {product.compareAtPrice && <span className="sr-only">now </span>}
            {formatPrice(product.price, { whole: true })}
          </p>
        </div>
      </Link>
      <ul className="mt-3 flex gap-1.5" aria-label="Available colours">
        {product.colors.map((c) => (
          <li key={c.name}>
            <span className="block h-3.5 w-3.5 rounded-full border border-navy/20" style={{ backgroundColor: c.hex }} title={c.name}>
              <span className="sr-only">{c.name}</span>
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
