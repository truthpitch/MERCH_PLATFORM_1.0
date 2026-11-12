/**
 * Product data layer — the ONLY module that touches the catalog source.
 *
 * Phase 1: reads local mock data.
 * Phase 2: swap the bodies of these functions for database queries
 *          (e.g. Prisma/Drizzle). Signatures stay the same, so pages
 *          and components don't change.
 */
import { products as mockProducts } from "@/data/products";
import { applyFilters, buildFilterOptions } from "@/lib/filters";
import { getVariants } from "@/lib/variants";
import type { FilterOptions, Product, ProductFilters, ProductVariant } from "@/types";

async function source(): Promise<Product[]> {
  // Phase 2: return db.product.findMany({ where: { status: "approved" }, include: { images: true } })
  return mockProducts;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  return applyFilters(await source(), filters);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await source();
  return all.find((p) => p.slug === slug && p.status === "approved") ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const all = await source();
  return all.find((p) => p.id === id) ?? null;
}

export async function getAllProductSlugs(): Promise<string[]> {
  return (await getProducts()).map((p) => p.slug);
}

export async function getLatestDrop(limit = 6): Promise<Product[]> {
  const fresh = await getProducts({ isNew: true, sort: "newest" });
  if (fresh.length >= limit) return fresh.slice(0, limit);
  const rest = (await getProducts({ sort: "newest" })).filter((p) => !p.isNew);
  return [...fresh, ...rest].slice(0, limit);
}

export async function getBestSellers(limit = 4): Promise<Product[]> {
  return getProducts({ isBestSeller: true, limit });
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const all = await getProducts();
  const others = all.filter((p) => p.id !== product.id);
  const same = others.filter((p) => p.category === product.category);
  const rest = others.filter((p) => p.category !== product.category);
  return [...same, ...rest].slice(0, limit);
}

export async function getFilterOptions(): Promise<FilterOptions> {
  return buildFilterOptions(await source());
}

/* Variants: see lib/variants.ts (pure helpers, shared with the client). */

export async function getVariantById(id: string): Promise<{ product: Product; variant: ProductVariant } | null> {
  const productId = id.split("__")[0];
  const product = await getProductById(productId);
  if (!product) return null;
  const variant = getVariants(product).find((v) => v.id === id);
  return variant ? { product, variant } : null;
}
