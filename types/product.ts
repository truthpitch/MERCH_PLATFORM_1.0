/**
 * Product domain types — the shape pages and components work with.
 *
 * Phase 2: lib/products.ts maps database rows (Design + DesignImage +
 * ProductVariant + creator User) into these types, so UI code is the same
 * for TruthPitch products and approved community designs.
 */

export type ProductCategory = "tees" | "hoodies" | "hats" | "accessories";

/** Matches the Prisma ProductType enum. */
export type ProductTypeId = "TEE" | "HOODIE" | "HAT" | "TOTE" | "MUG" | "BOTTLE";

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
  /** User id of the creator */
  id: string;
  name: string;
  username?: string | null;
  avatar?: string | null;
  /** Public profile URL (/creators/[username]) for community creators */
  href?: string;
}

/** Artwork placement for community designs, rendered on garment mockups. */
export interface ProductMockup {
  artworkUrl: string;
  /** Offsets in % of the print area, -50…50 */
  x: number;
  y: number;
  /** 0.3…1.6 */
  scale: number;
}

/**
 * A purchasable combination of size + color. In Phase 1 variants are
 * derived from the product's sizes × colors; in Phase 2 they come from
 * the database (and from Printful's catalog variant ids).
 */
export interface ProductVariant {
  id: string;
  productId: string;
  productType: ProductTypeId;
  sku: string;
  size: ProductSize;
  color: ProductColor;
  /** Price in the store's minor-safe decimal (USD dollars, 2dp). */
  price: number;
  compareAtPrice?: number;
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
  /** Primary category (first product type) */
  category: ProductCategory;
  /** Every category the design is available in */
  categories: ProductCategory[];
  productTypes: ProductTypeId[];
  variants: ProductVariant[];
  /** True for approved user-submitted designs */
  isCommunity: boolean;
  /** Present for community designs (artwork on a garment mockup) */
  mockup?: ProductMockup;
  colors: ProductColor[];
  sizes: ProductSize[];
  description: string;
  /** The message / meaning behind the design */
  story: string;
  details: string[];
  images: ProductImage[];
  isNew: boolean;
  isBestSeller: boolean;
  /** TruthPitch (admin) or the community creator */
  designer: Designer;
  status: ProductStatus;
  tags: string[];
  createdAt: string; // ISO date
  /** Units sold (for "popular" sorting) */
  unitsSold: number;
}

export type ProductSort = "featured" | "newest" | "popular" | "price-asc" | "price-desc";

export interface ProductFilters {
  category?: ProductCategory | null;
  sizes?: ProductSize[];
  colors?: string[]; // color names
  minPrice?: number | null;
  maxPrice?: number | null;
  isNew?: boolean;
  isBestSeller?: boolean;
  /** true = community only, false = TruthPitch only */
  community?: boolean;
  creatorUsername?: string;
  productType?: ProductTypeId | null;
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
