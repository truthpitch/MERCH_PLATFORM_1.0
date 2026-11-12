"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { EASE_IN_OUT, EASE_OUT } from "@/lib/motion";

/** Flips to true after the first client render — never mutated on the server. */
let hasNavigated = false;

/**
 * Route transition used by app/template.tsx (remounts per navigation).
 * The very first page load skips the curtain (no hidden content in SSR
 * HTML); every client-side navigation after that gets a navy curtain that
 * wipes away while the new page rises in.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const [animate] = useState(() => hasNavigated);

  useEffect(() => {
    hasNavigated = true;
  }, []);

  if (!animate) return <>{children}</>;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[90] flex origin-top items-center justify-center bg-navy"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.8, ease: EASE_IN_OUT, delay: 0.1 }}
      >
        <motion.span
          className="text-2xl font-bold tracking-[-0.045em] text-white"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          Truth<span className="text-sand">Pitch</span>
        </motion.span>
      </motion.div>
      <motion.div initial={{ y: 40 }} animate={{ y: 0 }} transition={{ duration: 1, ease: EASE_OUT, delay: 0.15 }}>
        {children}
      </motion.div>
    </>
  );
}
