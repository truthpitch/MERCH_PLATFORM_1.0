"use client";

import { MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Cursor } from "@/components/layout/Cursor";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { scrollToTop } from "@/lib/lenis";
import { trackPath } from "@/lib/nav";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";

/**
 * Client-side app shell: motion preferences, smooth scroll, cursor,
 * cart hydration and per-route housekeeping.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Rehydrate the persisted cart after mount (avoids SSR mismatch).
  useEffect(() => {
    const unsub = useCart.persist.onFinishHydration(() => useUi.getState().setCartHydrated());
    void useCart.persist.rehydrate();
    return unsub;
  }, []);

  // Close overlays and reset scroll on route change.
  useEffect(() => {
    trackPath(pathname);
    useCart.getState().close();
    useUi.getState().setMenuOpen(false);
    if (!window.location.hash) scrollToTop(true);
  }, [pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <Cursor />
      {children}
      <CartDrawer />
    </MotionConfig>
  );
}
