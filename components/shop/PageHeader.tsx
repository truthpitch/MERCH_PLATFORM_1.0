import type { ReactNode } from "react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  className?: string;
  highlight?: string[];
}

/** Oversized page title used on Shop, Cart, Checkout, Contact. */
export function PageHeader({ eyebrow, title, description, className, highlight }: PageHeaderProps) {
  return (
    <header className={cn("container-tp pb-10 pt-[calc(var(--tp-nav-h)+3rem)] sm:pb-14 sm:pt-[calc(var(--tp-nav-h)+4.5rem)]", className)}>
      <p className="eyebrow flex items-center gap-3 text-brown">
        <span aria-hidden className="inline-block h-px w-8 bg-current" />
        {eyebrow}
      </p>
      <AnimatedText
        as="h1"
        text={title}
        play
        highlight={highlight}
        className="mt-5 text-[clamp(3.25rem,10vw,9rem)] font-bold leading-[0.86] tracking-[-0.055em]"
      />
      {description && <div className="mt-6 max-w-xl text-lg text-muted">{description}</div>}
    </header>
  );
}
