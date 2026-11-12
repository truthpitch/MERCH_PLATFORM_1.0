"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { lockScroll, unlockScroll } from "@/lib/lenis";
import { isFirstDocumentLoad } from "@/lib/nav";
import { EASE_IN_OUT, EASE_OUT } from "@/lib/motion";
import { useUi } from "@/store/ui";

const STORAGE_KEY = "tp-preloaded";
const LETTERS = "TruthPitch".split("");

/**
 * Intro preloader — plays once per session on the first document load of
 * the home page. Rendered in the SSR HTML so the hero never flashes; an
 * inline script in <head> hides it instantly on repeat visits.
 */
export function Preloader() {
  const introDone = useUi((s) => s.introDone);
  const [phase, setPhase] = useState<"loading" | "leaving" | "done">("loading");
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => String(Math.round(v)).padStart(3, "0"));
  const progress = useTransform(count, [0, 100], [0, 1]);

  useEffect(() => {
    const isFirst = isFirstDocumentLoad();
    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (seen || !isFirst || reduce || useUi.getState().introDone) {
      useUi.getState().setIntroDone();
      return;
    }

    lockScroll();
    const controls = animate(count, 100, { duration: 1.8, ease: [0.65, 0, 0.35, 1], delay: 0.35 });
    let unlocked = false;
    controls.then(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      setPhase("leaving");
      useUi.getState().setIntroDone();
      unlockScroll();
      unlocked = true;
    });
    return () => {
      controls.stop();
      if (!unlocked) unlockScroll();
    };
  }, [count]);

  if (phase === "done" || (introDone && phase === "loading")) return null;

  return (
    <motion.div
      data-preloader
      aria-hidden
      className="surface-dark fixed inset-0 z-[85] flex flex-col justify-between bg-navy p-5 text-white sm:p-8"
      initial={false}
      animate={{ y: phase === "leaving" ? "-100%" : "0%" }}
      transition={{ duration: 1, ease: EASE_IN_OUT }}
      onAnimationComplete={() => phase === "leaving" && setPhase("done")}
    >
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.2em] text-sand/80">
        <span>Say it straight</span>
        <span>Est. 2024</span>
      </div>

      <div className="flex justify-center overflow-hidden">
        <p className="flex text-[clamp(3.5rem,15vw,13rem)] font-bold leading-[0.9] tracking-[-0.06em]">
          {LETTERS.map((l, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.06em]">
              <motion.span
                className={i >= 5 ? "inline-block text-sand" : "inline-block"}
                initial={{ y: "105%" }}
                animate={{ y: phase === "leaving" ? "-105%" : "0%" }}
                transition={{
                  duration: phase === "leaving" ? 0.6 : 0.9,
                  ease: EASE_OUT,
                  delay: phase === "leaving" ? i * 0.02 : 0.1 + i * 0.045,
                }}
              >
                {l}
              </motion.span>
            </span>
          ))}
        </p>
      </div>

      <div>
        <div className="flex items-end justify-between">
          <span className="text-xs uppercase tracking-[0.2em] text-sand/80">Loading the truth</span>
          <motion.span className="text-5xl font-bold tabular-nums tracking-tight sm:text-7xl">{rounded}</motion.span>
        </div>
        <div className="mt-4 h-px w-full bg-white/15">
          <motion.div className="h-full origin-left bg-sand" style={{ scaleX: progress }} />
        </div>
      </div>
    </motion.div>
  );
}
