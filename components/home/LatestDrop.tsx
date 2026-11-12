"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { ArrowRightIcon } from "@/components/ui/Icons";
import type { Product } from "@/types";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pinned horizontal-scroll rail (GSAP ScrollTrigger) on tablet/desktop.
 * Phones and reduced-motion users get a native, swipeable scroll-snap rail.
 */
export function LatestDrop({ products }: { products: Product[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      section.dataset.pinned = "true";
      const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
      return () => {
        delete section.dataset.pinned;
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    // Re-measure once fonts, images and the route transition have settled.
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 1200);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", onLoad);
      mm.revert();
    };
  }, []);

  // GSAP wraps the pinned <section> in a .pin-spacer; this React-owned
  // wrapper keeps unmounting (route changes) from touching that node.
  return (
    <div>
    <section
      ref={sectionRef}
      aria-labelledby="latest-drop-title"
      className="group/drop surface-dark relative overflow-hidden bg-navy text-white md:flex md:h-dvh md:flex-col md:justify-center"
    >
      <div className="container-tp flex items-end justify-between gap-6 pb-10 pt-20 md:pt-[calc(var(--tp-nav-h)+1rem)]">
        <div>
          <p className="eyebrow flex items-center gap-3 text-sand">
            <span aria-hidden className="inline-block h-px w-8 bg-current" />
            Drop 04 · {products.length} pieces
          </p>
          <AnimatedText
            as="h2"
            id="latest-drop-title"
            text="The Latest Drop"
            className="mt-4 text-5xl font-bold leading-[0.9] tracking-[-0.05em] sm:text-7xl lg:text-8xl"
          />
        </div>
        <Link
          href="/shop?sort=newest"
          className="group hidden shrink-0 items-center gap-2 border-b border-sand/50 pb-1 font-semibold text-sand sm:inline-flex"
        >
          Shop all new
          <ArrowRightIcon size={18} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-16 will-change-transform sm:px-6 md:gap-8 md:pb-10 lg:px-10 group-data-[pinned=true]/drop:snap-none group-data-[pinned=true]/drop:overflow-visible"
        data-lenis-prevent-touch
      >
        {products.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            index={i}
            tone="dark"
            sizes="(min-width: 1024px) 26vw, (min-width: 768px) 38vw, 78vw"
            className="w-[78vw] shrink-0 snap-start sm:w-[46vw] md:w-[34vw] lg:w-[26vw]"
          />
        ))}
        <Link
          href="/shop"
          data-cursor="Shop"
          className="group flex aspect-[4/5] w-[78vw] shrink-0 snap-start flex-col justify-between rounded-lg border border-white/15 p-8 transition-colors hover:bg-white/5 sm:w-[46vw] md:w-[34vw] lg:w-[26vw]"
        >
          <span className="eyebrow text-sand">Everything else</span>
          <span className="text-5xl font-bold leading-[0.9] tracking-[-0.05em] lg:text-6xl">
            See the
            <br />
            full shop
          </span>
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sand text-navy transition-transform duration-500 group-hover:-rotate-45">
            <ArrowRightIcon />
          </span>
        </Link>
      </div>

      <div className="container-tp hidden pb-10 group-data-[pinned=true]/drop:block" aria-hidden>
        <div className="h-px w-full bg-white/15">
          <span ref={barRef} className="block h-full origin-left scale-x-0 bg-sand" />
        </div>
      </div>
    </section>
    </div>
  );
}
