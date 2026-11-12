import type { ProductColor, ProductSize } from "./product";

/**
 * A line in the cart. Denormalised (name/image/price snapshot) so the cart
 * renders without a lookup; the server re-prices from `variantId` at checkout.
 */
export interface CartItem {
  /** Stable line id = variantId (same variant merges into one line) */
  id: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  price: number;
  size: ProductSize;
  color: ProductColor;
  quantity: number;
  designerName: string;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
}
