import type { ReactNode } from "react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
  tone?: "dark" | "light";
  size?: "md" | "lg";
  highlight?: string[];
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  as = "h2",
  align = "left",
  action,
  className,
  tone = "dark",
  size = "md",
  highlight,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className={cn("eyebrow mb-4 flex items-center gap-3", tone === "dark" ? "text-brown" : "text-sand", align === "center" && "justify-center")}>
            <span aria-hidden className="inline-block h-px w-8 bg-current" />
            {eyebrow}
          </p>
        )}
        <AnimatedText
          id={id}
          as={as}
          text={title}
          highlight={highlight}
          highlightClassName={tone === "dark" ? "text-accent" : "text-sand"}
          className={cn(
            "font-bold leading-[0.95] tracking-[-0.04em]",
            size === "lg" ? "text-5xl sm:text-6xl lg:text-7xl" : "text-4xl sm:text-5xl lg:text-6xl",
          )}
        />
        {description && <div className={cn("mt-5 max-w-xl text-base sm:text-lg", tone === "dark" ? "text-muted" : "text-white/75", align === "center" && "mx-auto")}>{description}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
