"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { Wordmark } from "@/components/layout/Wordmark";
import { ArrowUpRightIcon, CloseIcon, socialIcons } from "@/components/ui/Icons";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { EASE_IN_OUT, EASE_OUT } from "@/lib/motion";
import { features, siteConfig } from "@/lib/site";
import { useUi } from "@/store/ui";

const links = [{ label: "Home", href: "/" }, ...siteConfig.nav, { label: "Cart", href: "/cart" }];

/** Full-screen mobile menu: curtain wipe + staggered oversized links. */
export function MobileMenu() {
  const open = useUi((s) => s.menuOpen);
  const setOpen = useUi((s) => s.setMenuOpen);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useScrollLock(open);
  useFocusTrap(ref, open, close);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="surface-dark fixed inset-0 z-[70] flex flex-col overflow-hidden bg-navy text-white md:hidden"
          initial={{ y: "-100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: EASE_IN_OUT }}
        >
          <div className="container-tp flex h-[var(--tp-nav-h)] items-center justify-between">
            <Link href="/" onClick={close} className="text-2xl leading-none">
              <Wordmark accent="text-sand" />
            </Link>
            <button
              type="button"
              onClick={close}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20"
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>

          <nav aria-label="Mobile" className="container-tp flex flex-1 flex-col justify-center">
            <ul className="space-y-1">
              {links.map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "110%" }}
                    transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.25 + i * 0.06 }}
                  >
                    <Link
                      href={l.href}
                      onClick={close}
                      className="group flex items-baseline gap-4 text-[clamp(2.75rem,14vw,5rem)] font-bold leading-[1] tracking-[-0.05em]"
                    >
                      <span className="text-sm font-medium tracking-normal text-sand/70 tabular-nums">0{i + 1}</span>
                      {l.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
              {features.auth && (
                <li>
                  <Link href="/sign-in" onClick={close} className="mt-4 inline-block text-lg text-sand">
                    Sign in
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <motion.div
            className="container-tp flex items-center justify-between gap-4 border-t border-white/10 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.6 } }}
            exit={{ opacity: 0 }}
          >
            <ul className="flex gap-2">
              {siteConfig.socials.map((s) => {
                const Icon = socialIcons[s.label];
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.label} (opens in new tab)`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20"
                    >
                      <Icon size={18} />
                    </a>
                  </li>
                );
              })}
            </ul>
            <a href={`mailto:${siteConfig.email}`} className="inline-flex items-center gap-1 text-sm text-sand">
              Say hi <ArrowUpRightIcon size={16} />
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
