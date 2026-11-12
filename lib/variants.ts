/**
 * Variant helpers (pure — safe on client and server).
 * Phase 1 derives variants from sizes × colors. Phase 2 reads the
 * product_variants table, including Printful variant ids and stock.
 */
import type { Product, ProductColor, ProductSize, ProductVariant } from "@/types";

export function variantId(productId: string, size: ProductSize, color: ProductColor | string): string {
  const name = typeof color === "string" ? color : color.name;
  return `${productId}__${size}__${name}`.toLowerCase().replace(/\s+/g, "-");
}

export function getVariants(product: Product): ProductVariant[] {
  return product.colors.flatMap((color) =>
    product.sizes.map((size) => ({
      id: variantId(product.id, size, color),
      productId: product.id,
      sku: `${product.id}-${color.name.slice(0, 3)}-${size}`.toUpperCase().replace(/\s+/g, ""),
      size,
      color,
      price: product.price,
      stock: null,
    })),
  );
}
