/**
 * Product domain types.
 *
 * Shaped to map 1:1 onto future database tables (Phase 2):
 *   products          ← Product (minus nested arrays)
 *   product_images    ← ProductImage (product_id FK, position)
 *   product_variants  ← ProductVariant (product_id FK, size, color, price, sku, stock)
 *   designers / users ← Designer (Product.designer.id FK)
 */

export type ProductCategory = "tees" | "hoodies" | "hats" | "accessories";

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "One Size";

/** Lifecycle status — Phase 2 user designs move pending → approved/rejected. */
export type ProductStatus = "draft" | "pending" | "approved" | "rejected" | "archived";

export interface ProductColor {
  /** Display name, e.g. "Deep Navy" */
  name: string;
  /** Hex used for the swatch */
  hex: string;
}

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Designer {
  /** "truthpitch" for in-house designs; a user id in Phase 2. */
  id: string;
  name: string;
  /** Optional profile URL (Phase 2) */
  href?: string;
}

/**
 * A purchasable combination of size + color. In Phase 1 variants are
 * derived from the product's sizes × colors; in Phase 2 they come from
 * the database (and from Printful's catalog variant ids).
 */
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: ProductSize;
  color: ProductColor;
  /** Price in the store's minor-safe decimal (USD dollars, 2dp). */
  price: number;
  /** null = unlimited (print-on-demand) */
  stock: number | null;
  /** Print-on-demand provider variant id (e.g. Printful sync_variant_id). */
  fulfillmentVariantId?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** One-liner shown on cards and in metadata */
  tagline: string;
  /** Base price in USD */
  price: number;
  compareAtPrice?: number;
  currency: "USD";
  category: ProductCategory;
  colors: ProductColor[];
  sizes: ProductSize[];
  description: string;
  /** The message / meaning behind the design */
  story: string;
  details: string[];
  images: ProductImage[];
  isNew: boolean;
  isBestSeller: boolean;
  /** Defaults to TruthPitch; Phase 2 user-submitted designs set this. */
  designer: Designer;
  status: ProductStatus;
  tags: string[];
  createdAt: string; // ISO date
}

export type ProductSort = "featured" | "newest" | "price-asc" | "price-desc";

export interface ProductFilters {
  category?: ProductCategory | null;
  sizes?: ProductSize[];
  colors?: string[]; // color names
  minPrice?: number | null;
  maxPrice?: number | null;
  isNew?: boolean;
  isBestSeller?: boolean;
  search?: string;
  sort?: ProductSort;
  limit?: number;
}

export interface FilterOptions {
  categories: { value: ProductCategory; label: string; count: number }[];
  sizes: ProductSize[];
  colors: ProductColor[];
  priceRange: { min: number; max: number };
}
