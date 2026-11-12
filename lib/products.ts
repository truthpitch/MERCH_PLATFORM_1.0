/**
 * Product data layer — the ONLY module pages use to read the catalog.
 *
 * Phase 2: reads approved Designs (+ images, variants, creator) from the
 * database via Prisma and maps them to the `Product` shape the UI already
 * understands. Signatures are unchanged from Phase 1.
 *
 * The catalog is small, so filtering/sorting reuses the pure helpers in
 * lib/filters.ts after one cached query per request. When the catalog grows,
 * push the ProductFilters into the Prisma `where` clause here — callers
 * won't need to change.
 */
import { cache } from "react";
import { db } from "@/lib/db";
import { PRODUCT_TYPE_SPECS, PRODUCT_TYPES } from "@/lib/catalog";
import { applyFilters, buildFilterOptions, SIZE_ORDER } from "@/lib/filters";
import type { Prisma } from "@/generated/prisma/client";
import type {
  FilterOptions,
  Product,
  ProductColor,
  ProductFilters,
  ProductSize,
  ProductTypeId,
  ProductVariant,
} from "@/types";

export const BRAND_NAME = "TruthPitch";

const designInclude = {
  creator: { select: { id: true, name: true, username: true, role: true, image: true } },
  images: { orderBy: { position: "asc" } },
  variants: { where: { active: true }, orderBy: [{ productType: "asc" }, { priceCents: "asc" }] },
} satisfies Prisma.DesignInclude;

type DesignRow = Prisma.DesignGetPayload<{ include: typeof designInclude }>;

const cents = (n: number) => Math.round(n) / 100;

function unique<T>(items: T[], key: (t: T) => string): T[] {
  const seen = new Map<string, T>();
  for (const item of items) if (!seen.has(key(item))) seen.set(key(item), item);
  return [...seen.values()];
}

export function toProduct(d: DesignRow, unitsSold = 0): Product {
  const isCommunity = d.creator.role !== "ADMIN";
  const productTypes = unique(d.variants.map((v) => v.productType as ProductTypeId), (t) => t).sort(
    (a, b) => PRODUCT_TYPES.indexOf(a) - PRODUCT_TYPES.indexOf(b),
  );
  const categories = unique(
    productTypes.map((t) => PRODUCT_TYPE_SPECS[t].category),
    (c) => c,
  );

  const variants: ProductVariant[] = d.variants.map((v) => ({
    id: v.id,
    productId: d.id,
    productType: v.productType as ProductTypeId,
    sku: v.sku,
    size: v.size as ProductSize,
    color: { name: v.colorName, hex: v.colorHex },
    price: cents(v.priceCents),
    compareAtPrice: v.compareAtCents ? cents(v.compareAtCents) : undefined,
    stock: null,
    fulfillmentVariantId: v.fulfillmentVariantId ?? undefined,
  }));

  const prices = variants.map((v) => v.price);
  const compare = variants.map((v) => v.compareAtPrice).filter((n): n is number => typeof n === "number");
  const sizes = SIZE_ORDER.filter((s) => variants.some((v) => v.size === s));
  const colors: ProductColor[] = unique(
    variants.map((v) => v.color),
    (c) => c.name,
  );

  const designerName = isCommunity ? d.creator.name || d.creator.username || "Community creator" : BRAND_NAME;
  const images = isCommunity
    ? [{ src: d.imageUrl, alt: `${d.title} artwork by ${designerName}`, width: 1200, height: 1500 }]
    : d.images.length
      ? d.images.map((i) => ({ src: i.url, alt: i.alt, width: i.width, height: i.height }))
      : [{ src: d.imageUrl, alt: d.title, width: 1200, height: 1500 }];

  const details = d.details
    ? d.details.split("\n").map((s) => s.trim()).filter(Boolean)
    : productTypes[0]
      ? PRODUCT_TYPE_SPECS[productTypes[0]].details
      : [];

  return {
    id: d.id,
    slug: d.slug,
    name: d.title,
    tagline: d.tagline ?? "",
    price: prices.length ? Math.min(...prices) : 0,
    compareAtPrice: compare.length ? Math.min(...compare) : undefined,
    currency: "USD",
    category: categories[0] ?? "accessories",
    categories,
    productTypes,
    variants,
    isCommunity,
    mockup: isCommunity ? { artworkUrl: d.imageUrl, x: d.placementX, y: d.placementY, scale: d.placementScale } : undefined,
    colors,
    sizes,
    description: d.description,
    story: d.story,
    details,
    images,
    isNew: d.isNew || (isCommunity && !!d.approvedAt && Date.now() - d.approvedAt.getTime() < 1000 * 60 * 60 * 24 * 21),
    isBestSeller: d.isBestSeller,
    designer: {
      id: d.creator.id,
      name: designerName,
      username: d.creator.username,
      avatar: d.creator.image,
      href: isCommunity && d.creator.username ? `/creators/${d.creator.username}` : undefined,
    },
    status: "approved",
    tags: [],
    createdAt: (d.approvedAt ?? d.createdAt).toISOString(),
    unitsSold,
  };
}

/** Units sold per design (for "popular"). */
const unitsSoldByDesign = cache(async (): Promise<Map<string, number>> => {
  const rows = await db.orderItem.groupBy({
    by: ["variantId"],
    _sum: { quantity: true },
    where: { order: { status: { not: "CANCELLED" } } },
  });
  if (rows.length === 0) return new Map();
  const variants = await db.productVariant.findMany({
    where: { id: { in: rows.map((r) => r.variantId) } },
    select: { id: true, designId: true },
  });
  const designOf = new Map(variants.map((v) => [v.id, v.designId]));
  const totals = new Map<string, number>();
  for (const r of rows) {
    const designId = designOf.get(r.variantId);
    if (designId) totals.set(designId, (totals.get(designId) ?? 0) + (r._sum.quantity ?? 0));
  }
  return totals;
});

/** All approved designs, mapped once per request. */
const source = cache(async (): Promise<Product[]> => {
  const [rows, sold] = await Promise.all([
    db.design.findMany({ where: { status: "APPROVED" }, include: designInclude, orderBy: { createdAt: "desc" } }),
    unitsSoldByDesign(),
  ]);
  return rows.filter((d) => d.variants.length > 0).map((d) => toProduct(d, sold.get(d.id) ?? 0));
});

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  return applyFilters(await source(), filters);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return (await source()).find((p) => p.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  return (await source()).find((p) => p.id === id) ?? null;
}

export async function getAllProductSlugs(): Promise<string[]> {
  return (await getProducts()).map((p) => p.slug);
}

export async function getLatestDrop(limit = 6): Promise<Product[]> {
  const fresh = await getProducts({ isNew: true, sort: "newest", community: false });
  if (fresh.length >= limit) return fresh.slice(0, limit);
  const rest = (await getProducts({ sort: "newest" })).filter((p) => !fresh.includes(p));
  return [...fresh, ...rest].slice(0, limit);
}

export async function getBestSellers(limit = 4): Promise<Product[]> {
  return getProducts({ isBestSeller: true, limit });
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const all = await getProducts();
  const others = all.filter((p) => p.id !== product.id);
  const sameCreator = product.isCommunity ? others.filter((p) => p.designer.id === product.designer.id) : [];
  const sameCategory = others.filter((p) => !sameCreator.includes(p) && p.categories.some((c) => product.categories.includes(c)));
  const rest = others.filter((p) => !sameCreator.includes(p) && !sameCategory.includes(p));
  return [...sameCreator, ...sameCategory, ...rest].slice(0, limit);
}

export async function getFilterOptions(filters: Pick<ProductFilters, "community"> = {}): Promise<FilterOptions> {
  return buildFilterOptions(await getProducts(filters));
}

/** Creators with at least one approved community design. */
export async function getMarketplaceCreators(): Promise<{ username: string; name: string; count: number }[]> {
  const products = await getProducts({ community: true });
  const map = new Map<string, { username: string; name: string; count: number }>();
  for (const p of products) {
    const u = p.designer.username;
    if (!u) continue;
    const entry = map.get(u) ?? { username: u, name: p.designer.name, count: 0 };
    entry.count += 1;
    map.set(u, entry);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function getVariantById(id: string): Promise<{ product: Product; variant: ProductVariant } | null> {
  for (const product of await source()) {
    const variant = product.variants.find((v) => v.id === id);
    if (variant) return { product, variant };
  }
  return null;
}
