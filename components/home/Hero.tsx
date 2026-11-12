"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { MediaReveal } from "@/components/ui/MediaReveal";
import { EASE_OUT } from "@/lib/motion";
import { useUi } from "@/store/ui";

const HERO_IMAGE = "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1600&h=2000&q=80";

export function Hero() {
  const play = useUi((s) => s.introDone);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const headlineY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: play ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    transition: { duration: 0.9, ease: EASE_OUT, delay },
  });

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative overflow-hidden pt-[calc(var(--tp-nav-h)+1.5rem)] lg:min-h-dvh">
      <div className="container-tp grid gap-10 pb-16 lg:grid-cols-12 lg:gap-8 lg:pb-12">
        <motion.div style={{ y: headlineY }} className="relative z-10 flex flex-col justify-between lg:col-span-7 lg:min-h-[calc(100dvh-var(--tp-nav-h)-4rem)]">
          <motion.div {...fade(0.1)} className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-navy px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sand" aria-hidden />
              Drop 04 — out now
            </span>
            <span className="text-muted">Printed to order. Shipped worldwide.</span>
          </motion.div>

          <AnimatedText
            as="h1"
            id="hero-title"
            text={"Say it\nstraight.\nWear what\nyou mean."}
            play={play}
            stagger={0.07}
            delay={0.15}
            duration={1.1}
            highlight={["straight."]}
            highlightClassName="text-accent"
            className="text-[clamp(3.4rem,10.5vw,10rem)] font-bold leading-[0.86] tracking-[-0.055em]"
          />

          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:mt-12 lg:flex-col lg:items-start 2xl:flex-row 2xl:items-end">
            <motion.p {...fade(0.9)} className="max-w-sm text-base text-muted sm:text-lg">
              Heavyweight goods for people who mean what they say. No filler. No hedging. Just the message, worn loud.
            </motion.p>
            <motion.div {...fade(1.05)} className="flex flex-wrap gap-3">
              <Button href="/shop" size="lg" magnetic icon={<ArrowRightIcon size={18} />} cursor="Shop">
                Shop the drop
              </Button>
              <Button href="/about" size="lg" variant="outline" magnetic>
                Our story
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <div className="relative lg:col-span-5">
          <MediaReveal
            src={HERO_IMAGE}
            alt="TruthPitch founder in streetwear, crouched on a brick ledge"
            sizes="(min-width: 1024px) 40vw, 100vw"
            priority
            play={play}
            delay={0.25}
            parallax={10}
            className="aspect-[4/5] rounded-lg lg:h-[calc(100dvh-var(--tp-nav-h)-4rem)] lg:aspect-auto"
          />
          <motion.div
            {...fade(1.2)}
            className="absolute -bottom-5 left-4 rounded-lg bg-white px-4 py-3 shadow-soft sm:left-6 lg:-left-10 lg:bottom-10"
          >
            <p className="eyebrow text-brown">The rule</p>
            <p className="mt-1 text-lg font-bold tracking-tight">If it&apos;s true, say it once.</p>
          </motion.div>
        </div>
      </div>

    </section>
  );
}
