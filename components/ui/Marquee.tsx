import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: readonly string[];
  /** Seconds per loop */
  duration?: number;
  reverse?: boolean;
  className?: string;
  itemClassName?: string;
  separator?: ReactNode;
  label?: string;
}

/**
 * Infinite CSS marquee (transform only). Content is duplicated once; the
 * duplicate is hidden from assistive tech. Pauses on hover; reduced motion
 * stops it via the global media query.
 */
export function Marquee({
  items,
  duration = 32,
  reverse,
  className,
  itemClassName,
  separator = <span aria-hidden className="mx-[0.4em] inline-block h-[0.3em] w-[0.3em] translate-y-[-0.15em] rounded-full bg-current opacity-60" />,
  label = "Brand slogans",
}: MarqueeProps) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <li key={i} className={cn("flex shrink-0 items-center whitespace-nowrap px-[0.4em]", itemClassName)}>
          {item}
          {separator}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={cn("group relative flex overflow-hidden", className)} role="region" aria-label={label}>
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={{ "--marquee-duration": `${duration}s`, animationDirection: reverse ? "reverse" : "normal" } as CSSProperties}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
