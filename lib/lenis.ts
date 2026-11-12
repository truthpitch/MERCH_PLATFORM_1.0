"use client";

import type Lenis from "lenis";

/** Single shared Lenis instance (set by <SmoothScroll />). */
let instance: Lenis | null = null;
let lockCount = 0;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}

/**
 * Reference-counted scroll lock used by drawers, menus and modals.
 * Works with and without Lenis (reduced motion disables Lenis).
 */
export function lockScroll() {
  lockCount += 1;
  if (lockCount === 1) {
    instance?.stop();
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    if (scrollbar > 0) document.documentElement.style.paddingRight = `${scrollbar}px`;
  }
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    instance?.start();
    document.documentElement.style.overflow = "";
    document.documentElement.style.paddingRight = "";
  }
}

export function scrollToTop(immediate = true) {
  if (instance) instance.scrollTo(0, { immediate, force: true });
  else window.scrollTo({ top: 0, behavior: immediate ? "instant" : "smooth" });
}
