"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/** Two oversized lines sliding in opposite directions as you scroll. */
export function ScrollQuote() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["8%", "-28%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-30%", "6%"]);

  return (
    <section ref={ref} aria-label="Truth over comfort. Every single time." className="surface-dark overflow-hidden bg-navy py-20 text-white sm:py-28">
      <div aria-hidden className="space-y-2 whitespace-nowrap text-[clamp(4rem,13vw,13rem)] font-bold leading-[0.9] tracking-[-0.06em]">
        <motion.p style={{ x: x1 }}>
          Truth over comfort <span className="text-sand">—</span> truth over comfort
        </motion.p>
        <motion.p style={{ x: x2 }} className="text-sand">
          every single time <span className="text-white">—</span> every single time
        </motion.p>
      </div>
    </section>
  );
}
