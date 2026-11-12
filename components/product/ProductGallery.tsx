"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { ArrowLeftIcon, ArrowRightIcon, ZoomIcon } from "@/components/ui/Icons";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const go = useCallback((dir: 1 | -1) => setActive((i) => (i + dir + images.length) % images.length), [images.length]);

  return (
    <div className="lg:sticky lg:top-24">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
        {/* Thumbnails */}
        {images.length > 1 && (
          <div role="tablist" aria-label={`${name} images`} className="no-scrollbar flex gap-3 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-visible">
            {images.map((img, i) => (
              <button
                key={img.src}
                role="tab"
                type="button"
                aria-selected={i === active}
                aria-controls="gallery-main"
                onClick={() => setActive(i)}
                className={cn(
                  "relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-md bg-sand-200 transition-opacity sm:w-full",
                  i === active ? "ring-2 ring-navy ring-offset-2 ring-offset-paper" : "opacity-60 hover:opacity-100",
                )}
              >
                <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
                <span className="sr-only">Show image {i + 1}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div id="gallery-main" role="tabpanel" className="relative flex-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            data-cursor="Zoom"
            className="group relative block aspect-[4/5] w-full overflow-hidden rounded-lg bg-sand-200"
            aria-label={`Open full-screen view of ${images[active].alt}`}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE_OUT }}
              >
                <Image
                  src={images[active].src}
                  alt={images[active].alt}
                  fill
                  priority={active === 0}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
            <span className="absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-navy shadow-soft transition-transform group-hover:scale-110">
              <ZoomIcon />
            </span>
          </button>
          {images.length > 1 && (
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-soft hover:bg-white">
                <ArrowLeftIcon size={18} />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next image" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-soft hover:bg-white">
                <ArrowRightIcon size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      <Lightbox images={images} index={active} onIndex={setActive} open={open} onClose={() => setOpen(false)} name={name} />
    </div>
  );
}

function Lightbox({
  images,
  index,
  onIndex,
  open,
  onClose,
  name,
}: {
  images: ProductImage[];
  index: number;
  onIndex: (i: number) => void;
  open: boolean;
  onClose: () => void;
  name: string;
}) {
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const frameRef = useRef<HTMLDivElement>(null);

  const move = (dir: 1 | -1) => {
    setZoom(false);
    onIndex((index + dir + images.length) % images.length);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const track = (e: PointerEvent<HTMLDivElement>) => {
    if (!zoom || !frameRef.current) return;
    const r = frameRef.current.getBoundingClientRect();
    setOrigin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const toggleZoom = (e: PointerEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => {
    if ("clientX" in e && frameRef.current) {
      const r = frameRef.current.getBoundingClientRect();
      setOrigin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
    }
    setZoom((z) => !z);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setZoom(false);
        onClose();
      }}
      variant="full"
      dark
      title={`${name} — image ${index + 1} of ${images.length}`}
      headerExtra={<span className="hidden text-sm text-white/60 sm:inline">{zoom ? "Click to zoom out" : "Click image to zoom"}</span>}
    >
      <div className="flex h-full flex-col">
        <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4">
          <div
            ref={frameRef}
            role="button"
            tabIndex={0}
            aria-pressed={zoom}
            aria-label={zoom ? "Zoom out" : "Zoom in"}
            onPointerUp={toggleZoom}
            onPointerMove={track}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggleZoom(e))}
            className={cn("relative h-full max-h-[78dvh] w-full max-w-3xl overflow-hidden rounded-lg", zoom ? "cursor-zoom-out" : "cursor-zoom-in")}
          >
            <motion.div
              className="absolute inset-0"
              animate={{ scale: zoom ? 2.2 : 1 }}
              style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
            >
              <Image src={images[index].src} alt={images[index].alt} fill sizes="(min-width: 768px) 768px, 100vw" quality={90} className="object-contain" />
            </motion.div>
          </div>
          {images.length > 1 && (
            <>
              <button type="button" onClick={() => move(-1)} aria-label="Previous image" className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <ArrowLeftIcon />
              </button>
              <button type="button" onClick={() => move(1)} aria-label="Next image" className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <ArrowRightIcon />
              </button>
            </>
          )}
        </div>
        <div className="flex justify-center gap-2 pb-6">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => {
                setZoom(false);
                onIndex(i);
              }}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              className={cn("h-1.5 rounded-full transition-all", i === index ? "w-8 bg-sand" : "w-4 bg-white/30 hover:bg-white/60")}
            />
          ))}
        </div>
      </div>
    </Dialog>
  );
}
