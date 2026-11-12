"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Wordmark } from "@/components/layout/Wordmark";
import { BagIcon, MenuIcon, UserIcon } from "@/components/ui/Icons";
import { Magnetic } from "@/components/ui/Magnetic";
import { EASE_OUT } from "@/lib/motion";
import { features, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { selectItemCount, useCart } from "@/store/cart";
import { useUi } from "@/store/ui";

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const count = useCart(selectItemCount);
  const pulse = useCart((s) => s.addPulse);
  const openCart = useCart((s) => s.open);
  const cartOpen = useCart((s) => s.isOpen);
  const menuOpen = useUi((s) => s.menuOpen);
  const setMenuOpen = useUi((s) => s.setMenuOpen);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    if (menuOpen || cartOpen) return;
    if (y > prev && y > 160) setHidden(true);
    else if (y < prev - 4 || y < 160) setHidden(false);
  });

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={false}
        animate={{ y: hidden && !menuOpen ? "-100%" : "0%" }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
      >
        <div
          className={cn(
            "transition-[background-color,box-shadow,backdrop-filter] duration-500",
            scrolled ? "bg-paper/85 shadow-[0_1px_0_rgb(11_37_69/0.08)] backdrop-blur-md" : "bg-transparent",
          )}
        >
          <nav aria-label="Main" className="container-tp flex h-[var(--tp-nav-h)] items-center justify-between gap-6">
            <Link href="/" className="text-2xl leading-none sm:text-[1.65rem]" aria-label="TruthPitch — home">
              <Wordmark />
            </Link>

            <ul className="hidden items-center gap-1 md:flex">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="group relative inline-flex h-10 items-center px-4 text-[0.9375rem] font-medium"
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-4 bottom-1.5 h-[2px] origin-right scale-x-0 bg-current transition-transform duration-500 ease-[var(--tp-ease-out)] group-hover:origin-left group-hover:scale-x-100",
                        isActive(item.href) && "origin-left scale-x-100 bg-accent",
                      )}
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1 sm:gap-2">
              {features.auth && (
                <Link
                  href="/sign-in"
                  className="hidden h-10 items-center gap-2 rounded-full px-3 text-sm font-medium hover:bg-navy/5 sm:inline-flex"
                >
                  <UserIcon size={18} /> Sign in
                </Link>
              )}
              <Magnetic strength={0.4}>
                <button
                  type="button"
                  onClick={openCart}
                  className="relative inline-flex h-11 items-center gap-2 rounded-full bg-navy pl-4 pr-3 text-sm font-semibold text-white transition-colors hover:bg-accent"
                  aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
                >
                  <motion.span key={pulse} initial={pulse ? { rotate: -18, scale: 1.25 } : false} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 12 }} className="inline-flex">
                    <BagIcon size={18} />
                  </motion.span>
                  <span className="hidden sm:inline">Cart</span>
                  <span className="relative inline-flex h-6 min-w-6 items-center justify-center overflow-hidden rounded-full bg-sand px-1.5 text-xs font-bold text-navy tabular-nums">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={count}
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "-100%" }}
                        transition={{ duration: 0.35, ease: EASE_OUT }}
                      >
                        {count}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </button>
              </Magnetic>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy/15 md:hidden"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
              >
                <MenuIcon />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>
      <MobileMenu />
    </>
  );
}
