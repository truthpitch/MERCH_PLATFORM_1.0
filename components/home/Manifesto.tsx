"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

const MANIFESTO =
  "We don't do vague. We don't sand the edges off what matters. TruthPitch is for people who say the hard thing kindly, keep their word when it costs them, and stand behind what they put their name on. Every piece is a sentence you'd say out loud.";

const ACCENT = new Set(["hard", "thing", "word", "loud."]);

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className={ACCENT.has(word.toLowerCase()) ? "text-sand" : undefined}>
      {word}{" "}
    </motion.span>
  );
}

/** Scroll-scrubbed manifesto: words light up as you read (opacity only). */
export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = MANIFESTO.split(" ");

  return (
    <section aria-labelledby="manifesto-title" className="surface-dark relative bg-navy pb-28 pt-8 text-white sm:pb-40">
      <div className="container-tp grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <h2 id="manifesto-title" className="eyebrow flex items-center gap-3 text-sand lg:sticky lg:top-28">
            <span aria-hidden className="inline-block h-px w-8 bg-current" />
            The manifesto
          </h2>
        </div>
        <div ref={ref} className="lg:col-span-9">
          <p className="sr-only">{MANIFESTO}</p>
          <p aria-hidden className="text-[clamp(1.9rem,4.6vw,4.25rem)] font-bold leading-[1.08] tracking-[-0.035em]">
            {words.map((w, i) => {
              const start = i / words.length;
              return <Word key={i} word={w} progress={scrollYProgress} range={[start, start + 1 / words.length]} />;
            })}
          </p>
          <div className="mt-14 grid gap-8 border-t border-white/15 pt-10 sm:grid-cols-3">
            {[
              ["01", "Say it straight", "Clear beats clever. Every design says one thing, well."],
              ["02", "Built to last", "Heavyweight blanks, honest construction, printed to order."],
              ["03", "Own your word", "If we get it wrong, we say so and make it right."],
            ].map(([n, t, d]) => (
              <div key={n}>
                <p className="text-sm font-medium tabular-nums text-sand">{n}</p>
                <h3 className="mt-3 text-xl font-bold tracking-tight">{t}</h3>
                <p className="mt-2 text-white/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
