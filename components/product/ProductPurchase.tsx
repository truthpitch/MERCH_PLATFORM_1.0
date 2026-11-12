"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SizeGuide } from "@/components/product/SizeGuide";
import { Magnetic } from "@/components/ui/Magnetic";
import { BagIcon, CheckIcon, RulerIcon } from "@/components/ui/Icons";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { variantId } from "@/lib/variants";
import { MAX_LINE_QTY, useCart } from "@/store/cart";
import type { Product, ProductColor, ProductSize } from "@/types";

const LIGHT = new Set(["#FFFFFF", "#F2EDE4", "#D9C3A5"]);

export function ProductPurchase({ product }: { product: Product }) {
  const oneSize = product.sizes.length === 1;
  const [color, setColor] = useState<ProductColor>(product.colors[0]);
  const [size, setSize] = useState<ProductSize | null>(oneSize ? product.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const sizeGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 2200);
    return () => window.clearTimeout(t);
  }, [added]);

  const handleAdd = () => {
    if (!size) {
      setError("Pick a size first.");
      sizeGroupRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      return;
    }
    setError(null);
    addItem(
      {
        productId: product.id,
        variantId: variantId(product.id, size, color),
        slug: product.slug,
        name: product.name,
        image: product.images[0].src,
        imageAlt: product.images[0].alt,
        price: product.price,
        size,
        color,
        designerName: product.designer.name,
      },
      qty,
    );
    setAdded(true);
    setQty(1);
  };

  return (
    <div className="space-y-8">
      {/* Colour */}
      <fieldset>
        <legend className="mb-3 text-sm font-medium">
          Colour: <span className="font-semibold">{color.name}</span>
        </legend>
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Colour">
          {product.colors.map((c) => {
            const on = c.name === color.name;
            return (
              <button
                key={c.name}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={c.name}
                onClick={() => setColor(c)}
                className={cn(
                  "relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition-transform duration-300",
                  on ? "scale-105 border-navy ring-2 ring-navy ring-offset-[3px] ring-offset-paper" : "border-navy/20 hover:scale-110",
                )}
                style={{ backgroundColor: c.hex }}
              >
                {on && <CheckIcon size={18} className={LIGHT.has(c.hex) ? "text-navy" : "text-white"} />}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Size */}
      {!oneSize ? (
        <fieldset>
          <div className="mb-3 flex items-center justify-between">
            <legend className="text-sm font-medium">
              Size{size && <>: <span className="font-semibold">{size}</span></>}
            </legend>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              <RulerIcon size={18} /> Size guide
            </button>
          </div>
          <div
            ref={sizeGroupRef}
            role="radiogroup"
            aria-label="Size"
            aria-describedby={error ? "size-error" : undefined}
            className="grid grid-cols-3 gap-2 sm:grid-cols-6"
          >
            {product.sizes.map((s) => {
              const on = s === size;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    setSize(s);
                    setError(null);
                  }}
                  className={cn(
                    "h-12 rounded-md border text-sm font-semibold transition-colors",
                    on ? "border-navy bg-navy text-white" : "border-navy/20 bg-white hover:border-navy",
                    error && !size && "border-[#b42318]/60",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {error && (
              <motion.p
                id="size-error"
                role="alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-sm font-medium text-[#b42318]"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </fieldset>
      ) : (
        <p className="flex items-center justify-between text-sm">
          <span>
            Size: <span className="font-semibold">One size</span>
          </span>
          <button type="button" onClick={() => setGuideOpen(true)} className="inline-flex items-center gap-1.5 font-medium text-accent underline-offset-4 hover:underline">
            <RulerIcon size={18} /> Fit info
          </button>
        </p>
      )}

      {/* Quantity + Add */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <QuantityStepper value={qty} onChange={setQty} max={MAX_LINE_QTY} />
        <Magnetic className="flex-1" strength={0.15}>
          <motion.button
            type="button"
            onClick={handleAdd}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "relative inline-flex h-[3.25rem] w-full items-center justify-center gap-2 overflow-hidden rounded-full px-8 font-semibold text-white transition-colors duration-300",
              added ? "bg-accent" : "bg-navy hover:bg-accent",
            )}
            aria-live="polite"
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span
                  key="added"
                  className="inline-flex items-center gap-2"
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -24, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                >
                  <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.05 }} className="inline-flex">
                    <CheckIcon size={20} />
                  </motion.span>
                  Added to cart
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  className="inline-flex items-center gap-2"
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -24, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                >
                  <BagIcon size={20} /> Add to cart
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </Magnetic>
      </div>

      <SizeGuide open={guideOpen} onClose={() => setGuideOpen(false)} category={product.category} />
    </div>
  );
}
