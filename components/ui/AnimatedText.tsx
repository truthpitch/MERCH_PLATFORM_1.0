"use client";

import { motion, type Variants } from "framer-motion";
import type { ElementType } from "react";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  /** Use "\n" to force line breaks. */
  text: string;
  id?: string;
  as?: ElementType;
  className?: string;
  wordClassName?: string;
  /**
   * "inView" (default): reveal when scrolled into view.
   * boolean: reveal when true (e.g. after the preloader).
   */
  play?: "inView" | boolean;
  stagger?: number;
  delay?: number;
  duration?: number;
  /** Words (case-insensitive, punctuation ignored) to tint with the accent class */
  highlight?: string[];
  highlightClassName?: string;
}

/**
 * Word-by-word masked reveal. Screen readers get the plain sentence;
 * the animated spans are aria-hidden.
 */
export function AnimatedText({
  text,
  id,
  as: Tag = "p",
  className,
  wordClassName,
  play = "inView",
  stagger = 0.06,
  delay = 0,
  duration = 0.9,
  highlight = [],
  highlightClassName = "text-accent",
}: AnimatedTextProps) {
  const lines = text.split("\n");
  const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");
  const hl = new Set(highlight.map(norm));

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const word: Variants = {
    hidden: { y: "110%" },
    visible: { y: "0%", transition: { duration, ease: EASE_OUT } },
  };

  const animateProps =
    play === "inView"
      ? { initial: "hidden", whileInView: "visible", viewport: { once: true, amount: 0.35 } }
      : { initial: "hidden", animate: play ? "visible" : "hidden" };

  return (
    <Tag id={id} className={className}>
      <span className="sr-only">{text.replace(/\n/g, " ")}</span>
      <motion.span aria-hidden className="block" variants={container} {...animateProps}>
        {lines.map((line, li) => (
          <span key={li} className="block">
            {line.split(" ").map((w, wi) => {
              const isHl = hl.has(norm(w));
              return (
                <span key={wi} className="inline-block overflow-hidden pb-[0.08em] align-top -mb-[0.08em]">
                  <motion.span
                    variants={word}
                    className={cn("inline-block will-change-transform", wordClassName, isHl && highlightClassName)}
                  >
                    {w}
                  </motion.span>
                  {wi < line.split(" ").length - 1 && <span className="inline-block">&nbsp;</span>}
                </span>
              );
            })}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
