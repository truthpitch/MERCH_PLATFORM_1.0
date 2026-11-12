/**
 * Pure filtering / sorting helpers. No data imports, so this module is safe
 * to use on the client (shop grid) and the server (lib/products.ts).
 * In Phase 2 the same ProductFilters shape becomes a database query.
 */
import type {
  FilterOptions,
  Product,
  ProductCategory,
  ProductColor,
  ProductFilters,
  ProductSize,
  ProductSort,
} from "@/types";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  tees: "Tees",
  hoodies: "Hoodies",
  hats: "Hats",
  accessories: "Accessories",
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProductCategory[];

export const SIZE_ORDER: ProductSize[] = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function isCategory(v: unknown): v is ProductCategory {
  return typeof v === "string" && (CATEGORIES as string[]).includes(v);
}

export function isSort(v: unknown): v is ProductSort {
  return typeof v === "string" && SORT_OPTIONS.some((o) => o.value === v);
}

export function applyFilters(list: Product[], f: ProductFilters = {}): Product[] {
  let out = list.filter((p) => p.status === "approved");

  if (f.category) out = out.filter((p) => p.categories.includes(f.category!));
  if (f.productType) out = out.filter((p) => p.productTypes.includes(f.productType!));
  if (f.community === true) out = out.filter((p) => p.isCommunity);
  if (f.community === false) out = out.filter((p) => !p.isCommunity);
  if (f.creatorUsername) out = out.filter((p) => p.designer.username === f.creatorUsername);
  if (f.sizes?.length) out = out.filter((p) => p.sizes.some((s) => f.sizes!.includes(s)));
  if (f.colors?.length) out = out.filter((p) => p.colors.some((c) => f.colors!.includes(c.name)));
  if (f.minPrice != null) out = out.filter((p) => p.price >= f.minPrice!);
  if (f.maxPrice != null) out = out.filter((p) => p.price <= f.maxPrice!);
  if (f.isNew) out = out.filter((p) => p.isNew);
  if (f.isBestSeller) out = out.filter((p) => p.isBestSeller);
  if (f.search) {
    const q = f.search.toLowerCase();
    out = out.filter((p) => [p.name, p.tagline, p.designer.name, ...p.categories, ...p.tags].some((s) => s.toLowerCase().includes(q)));
  }

  out = sortProducts(out, f.sort ?? "featured");
  if (f.limit) out = out.slice(0, f.limit);
  return out;
}

export function sortProducts(list: Product[], sort: ProductSort): Product[] {
  const copy = [...list];
  switch (sort) {
    case "newest":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "popular":
      return copy.sort((a, b) => b.unitsSold - a.unitsSold || b.createdAt.localeCompare(a.createdAt));
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "featured":
    default:
      // Best sellers and new drops first, then newest.
      return copy.sort(
        (a, b) =>
          Number(b.isBestSeller) + Number(b.isNew) - (Number(a.isBestSeller) + Number(a.isNew)) ||
          b.createdAt.localeCompare(a.createdAt),
      );
  }
}

export function buildFilterOptions(list: Product[]): FilterOptions {
  const approved = list.filter((p) => p.status === "approved");
  const sizes = new Set<ProductSize>();
  const colors = new Map<string, ProductColor>();
  let min = Infinity;
  let max = 0;
  for (const p of approved) {
    p.sizes.forEach((s) => sizes.add(s));
    p.colors.forEach((c) => colors.set(c.name, c));
    min = Math.min(min, p.price);
    max = Math.max(max, p.price);
  }
  return {
    categories: CATEGORIES.map((value) => ({
      value,
      label: CATEGORY_LABELS[value],
      count: approved.filter((p) => p.categories.includes(value)).length,
    })),
    sizes: SIZE_ORDER.filter((s) => sizes.has(s)),
    colors: [...colors.values()],
    priceRange: { min: Number.isFinite(min) ? Math.floor(min) : 0, max: Math.ceil(max) },
  };
}
