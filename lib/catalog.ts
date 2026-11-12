/**
 * Product-type catalog: what a design can be printed on, at what price,
 * in which sizes/colours. Creators pick product types; TruthPitch sets
 * prices (curated platform). Pure data — safe on client and server.
 */
import type { ProductCategory, ProductColor, ProductSize, ProductTypeId } from "@/types";

export type { ProductTypeId };

export const PRODUCT_TYPES = ["TEE", "HOODIE", "HAT", "TOTE", "MUG", "BOTTLE"] as const satisfies readonly ProductTypeId[];

/** Types creators can choose in the studio. */
export const STUDIO_PRODUCT_TYPES = ["TEE", "HOODIE", "HAT"] as const satisfies readonly ProductTypeId[];
export type StudioProductType = (typeof STUDIO_PRODUCT_TYPES)[number];

export const COLORS = {
  white: { name: "White", hex: "#FFFFFF" },
  bone: { name: "Bone", hex: "#F2EDE4" },
  black: { name: "Black", hex: "#141414" },
  navy: { name: "Deep Navy", hex: "#0B2545" },
  grey: { name: "Heather Grey", hex: "#A4A7AB" },
  sand: { name: "Sand", hex: "#D9C3A5" },
} satisfies Record<string, ProductColor>;

interface TypeSpec {
  label: string;
  plural: string;
  category: ProductCategory;
  /** Base price for community designs, in cents */
  priceCents: number;
  sizes: ProductSize[];
  colors: ProductColor[];
  details: string[];
}

export const PRODUCT_TYPE_SPECS: Record<ProductTypeId, TypeSpec> = {
  TEE: {
    label: "Tee",
    plural: "Tees",
    category: "tees",
    priceCents: 3800,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [COLORS.white, COLORS.black, COLORS.navy, COLORS.bone],
    details: ["240gsm heavyweight cotton", "Boxy, dropped-shoulder fit", "Printed to order", "Wash cold, hang dry"],
  },
  HOODIE: {
    label: "Hoodie",
    plural: "Hoodies",
    category: "hoodies",
    priceCents: 8800,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [COLORS.black, COLORS.navy, COLORS.grey, COLORS.sand],
    details: ["450gsm brushed fleece", "Double-lined hood", "Printed to order", "Relaxed fit"],
  },
  HAT: {
    label: "Cap",
    plural: "Caps",
    category: "hats",
    priceCents: 3200,
    sizes: ["One Size"],
    colors: [COLORS.black, COLORS.sand, COLORS.navy],
    details: ["Washed cotton twill", "Unstructured, low profile", "Adjustable strap", "Printed patch"],
  },
  TOTE: {
    label: "Tote",
    plural: "Totes",
    category: "accessories",
    priceCents: 2800,
    sizes: ["One Size"],
    colors: [COLORS.sand, COLORS.bone],
    details: ["16oz cotton canvas"],
  },
  MUG: {
    label: "Mug",
    plural: "Mugs",
    category: "accessories",
    priceCents: 2200,
    sizes: ["One Size"],
    colors: [COLORS.white],
    details: ["12oz ceramic"],
  },
  BOTTLE: {
    label: "Bottle",
    plural: "Bottles",
    category: "accessories",
    priceCents: 3600,
    sizes: ["One Size"],
    colors: [COLORS.black],
    details: ["500ml insulated steel"],
  },
};

export function isProductType(v: unknown): v is ProductTypeId {
  return typeof v === "string" && (PRODUCT_TYPES as readonly string[]).includes(v);
}

/** Phase 1 category → product type, used by the seed script. */
export function typeForPhase1(category: ProductCategory, slug: string): ProductTypeId {
  if (category === "tees") return "TEE";
  if (category === "hoodies") return "HOODIE";
  if (category === "hats") return "HAT";
  if (slug.includes("mug")) return "MUG";
  if (slug.includes("bottle")) return "BOTTLE";
  return "TOTE";
}

export function sku(designId: string, type: ProductTypeId, size: string, color: string) {
  return `${designId}-${type}-${color.replace(/\s+/g, "").slice(0, 4)}-${size.replace(/\s+/g, "")}`.toUpperCase();
}

/** Variant rows for a community design (price comes from the catalog). */
export function catalogVariants(designId: string, types: readonly ProductTypeId[]) {
  return types.flatMap((type) => {
    const spec = PRODUCT_TYPE_SPECS[type];
    return spec.colors.flatMap((color) =>
      spec.sizes.map((size) => ({
        productType: type,
        size,
        colorName: color.name,
        colorHex: color.hex,
        priceCents: spec.priceCents,
        sku: sku(designId, type, size, color.name),
      })),
    );
  });
}
