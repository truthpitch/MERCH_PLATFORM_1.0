"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Product, ProductColor, ProductTypeId } from "@/types";

interface Selection {
  type: ProductTypeId;
  setType: (t: ProductTypeId) => void;
  color: ProductColor;
  setColor: (c: ProductColor) => void;
  colorsForType: (t: ProductTypeId) => ProductColor[];
}

const Ctx = createContext<Selection | null>(null);

/** Shares the chosen product type + colour between the gallery and purchase panel. */
export function ProductSelectionProvider({ product, children }: { product: Product; children: ReactNode }) {
  const colorsForType = (t: ProductTypeId) => {
    const seen = new Map<string, ProductColor>();
    for (const v of product.variants) if (v.productType === t && !seen.has(v.color.name)) seen.set(v.color.name, v.color);
    return [...seen.values()];
  };
  const firstType = product.productTypes[0] ?? "TEE";
  const [type, setTypeState] = useState<ProductTypeId>(firstType);
  const [color, setColor] = useState<ProductColor>(colorsForType(firstType)[0] ?? product.colors[0]);

  const setType = (t: ProductTypeId) => {
    setTypeState(t);
    const options = colorsForType(t);
    if (!options.some((c) => c.name === color.name)) setColor(options[0]);
  };

  return <Ctx.Provider value={{ type, setType, color, setColor, colorsForType }}>{children}</Ctx.Provider>;
}

export function useProductSelection(): Selection {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProductSelection must be used inside ProductSelectionProvider");
  return ctx;
}
