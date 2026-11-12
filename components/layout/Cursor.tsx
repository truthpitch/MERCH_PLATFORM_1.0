"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/hooks";

type Mode = "default" | "link" | "label" | "hidden";

/**
 * Custom cursor (fine pointers only, never with reduced motion).
 * Any element with `data-cursor="Shop"` grows the cursor and shows the label.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduce = usePrefersReducedMotion();
  const enabled = fine && !reduce;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.35 });

  const [mode, setMode] = useState<Mode>("hidden");
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      const text = labelled?.dataset.cursor;
      if (text) {
        setMode("label");
        setLabel(text);
      } else if (t?.closest("input, textarea, select, [contenteditable]")) {
        setMode("hidden");
      } else if (t?.closest("a, button, [role='button'], label, summary")) {
        setMode("link");
      } else {
        setMode("default");
      }
    };
    const onLeave = () => setMode("hidden");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const scale = mode === "label" ? 1 : mode === "link" ? 0.45 : mode === "hidden" ? 0 : 0.18;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100]"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-navy text-sand shadow-[0_0_0_1px_rgb(217_195_165/0.5)]"
        animate={{ scale, opacity: mode === "hidden" ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
      >
        <AnimatePresence mode="wait">
          {mode === "label" && (
            <motion.span
              key={label}
              className="text-sm font-semibold tracking-tight"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
