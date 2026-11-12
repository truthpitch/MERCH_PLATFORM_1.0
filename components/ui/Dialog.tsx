"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "@/components/ui/Icons";
import { useFocusTrap, useHydrated, useScrollLock } from "@/lib/hooks";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Visually hide the title (still announced) */
  hideTitle?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "center" | "right" | "full";
  className?: string;
  /** Extra content placed beside the close button */
  headerExtra?: ReactNode;
  dark?: boolean;
}

/**
 * Accessible modal/drawer: portal, focus trap, Escape + backdrop to close,
 * scroll lock (Lenis-aware), and transform/opacity enter/exit.
 */
export function Dialog({
  open,
  onClose,
  title,
  hideTitle,
  children,
  footer,
  variant = "center",
  className,
  headerExtra,
  dark,
}: DialogProps) {
  const hydrated = useHydrated();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useScrollLock(open);
  useFocusTrap(panelRef, open, onClose);

  if (!hydrated) return null;

  const panelMotion =
    variant === "right"
      ? { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } }
      : variant === "full"
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : { initial: { opacity: 0, y: 32, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 16, scale: 0.98 } };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" key="dialog">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-navy/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            {...panelMotion}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            className={cn(
              "absolute flex flex-col overflow-hidden outline-none",
              dark ? "surface-dark bg-navy text-white" : "bg-paper text-navy",
              variant === "right" && "inset-y-0 right-0 w-full max-w-md shadow-lift sm:rounded-l-lg",
              variant === "center" &&
                "inset-x-3 top-1/2 max-h-[88dvh] -translate-y-1/2 rounded-lg shadow-lift sm:inset-x-auto sm:left-1/2 sm:w-[min(40rem,calc(100vw-3rem))] sm:-translate-x-1/2",
              variant === "full" && "inset-0",
              className,
            )}
          >
            <div className={cn("flex items-center justify-between gap-4 px-5 py-4 sm:px-6", !hideTitle && "border-b border-current/10")}>
              <h2 id={titleId} className={cn("text-lg font-bold", hideTitle && "sr-only")}>
                {title}
              </h2>
              <div className="ml-auto flex items-center gap-2">
                {headerExtra}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-current/10"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" data-lenis-prevent>
              {children}
            </div>
            {footer && <div className="border-t border-current/10">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
