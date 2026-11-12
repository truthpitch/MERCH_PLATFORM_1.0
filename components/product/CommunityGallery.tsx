"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { GarmentMockup } from "@/components/product/GarmentMockup";
import { useProductSelection } from "@/components/product/ProductSelection";
import { Dialog } from "@/components/ui/Dialog";
import { ZoomIcon } from "@/components/ui/Icons";
import { PRODUCT_TYPE_SPECS } from "@/lib/catalog";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/** Gallery for community designs: live mockup in the selected type + colour, plus the raw artwork. */
export function CommunityGallery({ product }: { product: Product }) {
  const { type, setType, color, colorsForType } = useProductSelection();
  const [view, setView] = useState<"mockup" | "art">("mockup");
  const [open, setOpen] = useState(false);
  const mockup = product.mockup!;
  const art = mockup.artworkUrl;
  const svg = art.toLowerCase().endsWith(".svg");

  return (
    <div className="lg:sticky lg:top-24">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
        <div role="tablist" aria-label={`${product.name} views`} className="no-scrollbar flex gap-3 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-visible">
          {product.productTypes.map((t) => {
            const on = view === "mockup" && t === type;
            return (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={on}
                onClick={() => {
                  setType(t);
                  setView("mockup");
                }}
                className={cn(
                  "relative w-16 shrink-0 overflow-hidden rounded-md transition-opacity sm:w-full",
                  on ? "ring-2 ring-navy ring-offset-2 ring-offset-paper" : "opacity-60 hover:opacity-100",
                )}
              >
                <GarmentMockup type={t} color={t === type ? color.hex : colorsForType(t)[0]?.hex ?? "#fff"} mockup={mockup} sizes="80px" />
                <span className="sr-only">Show on {PRODUCT_TYPE_SPECS[t].label}</span>
              </button>
            );
          })}
          <button
            role="tab"
            type="button"
            aria-selected={view === "art"}
            onClick={() => setView("art")}
            className={cn(
              "relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-md bg-white transition-opacity sm:w-full",
              view === "art" ? "ring-2 ring-navy ring-offset-2 ring-offset-paper" : "opacity-60 hover:opacity-100",
            )}
          >
            <Image src={art} alt="" fill sizes="80px" unoptimized={svg} className="object-contain p-2" />
            <span className="sr-only">Show artwork</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          data-cursor="Zoom"
          aria-label={`Open full-screen view of the ${product.name} artwork`}
          className="group relative block aspect-[4/5] flex-1 overflow-hidden rounded-lg bg-sand-200"
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={view === "art" ? "art" : `${type}-${color.name}`}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
            >
              {view === "art" ? (
                <div className="absolute inset-0 bg-white">
                  <Image src={art} alt={product.images[0].alt} fill sizes="(min-width: 1024px) 50vw, 100vw" unoptimized={svg} className="object-contain p-10" />
                </div>
              ) : (
                <GarmentMockup
                  type={type}
                  color={color.hex}
                  mockup={mockup}
                  priority
                  sizes="(min-width: 1024px) 40vw, 80vw"
                  alt={`${product.name} on a ${color.name.toLowerCase()} ${PRODUCT_TYPE_SPECS[type].label.toLowerCase()}`}
                  className="absolute inset-0"
                />
              )}
            </motion.div>
          </AnimatePresence>
          <span className="absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-navy shadow-soft transition-transform group-hover:scale-110">
            <ZoomIcon />
          </span>
        </button>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} variant="full" dark title={`${product.name} — artwork`}>
        <div className="relative mx-auto h-full max-h-[82dvh] w-full max-w-3xl p-4">
          <div className="relative h-full w-full rounded-lg bg-white">
            <Image src={art} alt={product.images[0].alt} fill sizes="(min-width: 768px) 768px, 100vw" unoptimized={svg} className="object-contain p-8" />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
