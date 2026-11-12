"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Pill tab bar with an animated indicator (dashboard + admin). */
export function SubNav({ items, label, layoutId }: { items: { label: string; href: string; count?: number }[]; label: string; layoutId: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href.split("?")[0] === pathname);
  return (
    <nav aria-label={label} className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-1 rounded-full border border-navy/10 bg-white p-1">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors sm:px-5",
                  active ? "text-white" : "text-navy hover:text-accent",
                )}
              >
                {active && (
                  <motion.span layoutId={layoutId} className="absolute inset-0 rounded-full bg-navy" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
                )}
                <span className="relative">{item.label}</span>
                {typeof item.count === "number" && (
                  <span className={cn("relative text-xs tabular-nums", active ? "text-sand" : "text-muted")}>{item.count}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
