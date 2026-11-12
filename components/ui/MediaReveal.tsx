"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { EASE_IN_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface MediaRevealProps {
  src: string;
  alt: string;
  sizes: string;
  /** Aspect / size classes for the frame, e.g. "aspect-[4/5]" */
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  /** Parallax travel in % of frame height (0 = off) */
  parallax?: number;
  /** Mask reveal on scroll-in */
  reveal?: boolean;
  /** Reveal when true instead of on scroll (hero) */
  play?: boolean;
  delay?: number;
}

/**
 * Image frame with a curtain mask reveal (two counter-translating layers —
 * transform only, no clip-path repaint) and optional slow parallax.
 */
export function MediaReveal({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  priority,
  parallax = 0,
  reveal = true,
  play,
  delay = 0,
}: MediaRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-parallax}%`, `${parallax}%`]);
  const usesParallax = parallax > 0 && !reduce;

  const transition = { duration: 1.3, ease: EASE_IN_OUT, delay };
  const trigger =
    play === undefined
      ? { whileInView: "shown", viewport: { once: true, amount: 0.25 } }
      : { animate: play ? "shown" : "hidden" };

  // The trigger lives on the (unclipped) frame; layers inherit the variant.
  const frame = reveal ? { initial: "hidden", ...trigger } : {};
  const outer = reveal ? { variants: { hidden: { y: "100%" }, shown: { y: "0%", transition } } } : {};
  const counter = reveal ? { variants: { hidden: { y: "-100%" }, shown: { y: "0%", transition } } } : {};
  const zoom = reveal
    ? { variants: { hidden: { scale: 1.25 }, shown: { scale: 1, transition: { ...transition, duration: 1.8 } } } }
    : {};

  return (
    <motion.div ref={ref} className={cn("relative overflow-hidden bg-sand-200", className)} {...frame}>
      <motion.div className="absolute inset-0 overflow-hidden" {...outer}>
        <motion.div className="absolute inset-0" {...counter}>
          <motion.div className="absolute inset-0" {...zoom}>
            <motion.div
              className={cn("absolute inset-0", usesParallax && "-inset-y-[12%]")}
              style={usesParallax ? { y } : undefined}
            >
              <Image
                src={src}
                alt={alt}
                fill
                sizes={sizes}
                priority={priority}
                className={cn("object-cover", imageClassName)}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
