"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&h=1500&q=80`;

const CHAPTERS = [
  {
    year: "2019",
    title: "A voice note nobody asked for.",
    body: "It started as a habit: record the thing you'd normally soften, then play it back. Most of it was too harsh. Some of it was exactly right. That gap — between harsh and honest — became the whole idea.",
    image: u("1506794778202-cad84cf45f1d"),
    alt: "Portrait of the TruthPitch founder in a dark knit sweater",
  },
  {
    year: "2021",
    title: "Say it once. Say it clean.",
    body: "The voice notes became short videos. No hooks, no tricks, just one honest point per clip. People started quoting them back in the comments — and asking where they could get the shirt.",
    image: u("1475721027785-f74eccf877e2"),
    alt: "A microphone on stage under warm lights",
  },
  {
    year: "2023",
    title: "The people showed up.",
    body: "Meetups turned into talks, talks turned into a community of people who'd rather have the hard conversation than the easy lie. They didn't need a logo. They needed a line they could stand behind.",
    image: u("1540575467063-178a50c2df87"),
    alt: "An audience listening to a speaker at a TruthPitch event",
  },
  {
    year: "2024",
    title: "So we made it wearable.",
    body: "The first drop was three tees and a promise: heavyweight blanks, honest construction, and words we'd say to your face. Everything since has followed the same rule.",
    image: u("1490481651871-ab68de25d43d"),
    alt: "A rail of TruthPitch garments in the studio",
  },
];

/**
 * Scroll-driven story: a sticky image frame on the left swaps (mask wipe)
 * as each chapter on the right scrolls into the centre of the viewport.
 */
export function StoryChapters() {
  const [active, setActive] = useState(0);

  return (
    <section aria-labelledby="chapters-title" className="py-24 sm:py-32">
      <div className="container-tp">
        <h2 id="chapters-title" className="eyebrow flex items-center gap-3 text-brown">
          <span aria-hidden className="inline-block h-px w-8 bg-current" />
          How we got here
        </h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Sticky visual */}
          <div className="hidden lg:col-span-6 lg:block">
            <div className="sticky top-28">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-sand-200">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={active}
                    className="absolute inset-0"
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "-30%", opacity: 0.4 }}
                    transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      initial={{ y: "-60%", scale: 1.2 }}
                      animate={{ y: "0%", scale: 1 }}
                      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                    >
                      <Image src={CHAPTERS[active].image} alt={CHAPTERS[active].alt} fill sizes="45vw" className="object-cover" />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold tabular-nums text-navy">
                  {CHAPTERS[active].year}
                </div>
              </div>
              <ol className="mt-6 flex gap-2" aria-hidden>
                {CHAPTERS.map((c, i) => (
                  <li key={c.year} className="h-1 flex-1 overflow-hidden rounded-full bg-navy/10">
                    <motion.span
                      className="block h-full origin-left bg-navy"
                      initial={false}
                      animate={{ scaleX: i <= active ? 1 : 0 }}
                      transition={{ duration: 0.6, ease: EASE_OUT }}
                    />
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Chapters */}
          <ol className="lg:col-span-6">
            {CHAPTERS.map((c, i) => (
              <motion.li
                key={c.year}
                onViewportEnter={() => setActive(i)}
                viewport={{ amount: 0.6, margin: "-10% 0px -10% 0px" }}
                className="flex min-h-[70vh] flex-col justify-center py-10 first:pt-0 lg:min-h-[85vh]"
              >
                <div className="relative mb-8 aspect-[4/3] overflow-hidden rounded-lg bg-sand-200 lg:hidden">
                  <Image src={c.image} alt={c.alt} fill sizes="100vw" className="object-cover" />
                </div>
                <p
                  className={cn(
                    "text-[clamp(4rem,10vw,8rem)] font-bold leading-none tracking-[-0.06em] transition-colors duration-700",
                    active === i ? "text-accent" : "text-navy/15",
                  )}
                >
                  {c.year}
                </p>
                <h3 className="mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">{c.title}</h3>
                <p className="mt-4 max-w-lg text-lg text-navy/75">{c.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
