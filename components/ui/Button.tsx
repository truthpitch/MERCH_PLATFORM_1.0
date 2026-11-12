import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Magnetic } from "@/components/ui/Magnetic";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "light" | "ghost" | "brown";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-navy text-white hover:bg-navy-900 [--fill:var(--tp-accent)]",
  accent: "bg-accent text-white [--fill:var(--tp-navy)]",
  brown: "bg-brown text-white [--fill:var(--tp-navy)]",
  outline: "border border-navy/80 text-navy hover:text-white [--fill:var(--tp-navy)]",
  light: "bg-white text-navy [--fill:var(--tp-sand)]",
  ghost: "text-navy hover:bg-navy/5 [--fill:transparent]",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-14 px-8 text-base",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  magnetic?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
  /** Label for the custom cursor */
  cursor?: string;
}

type ButtonAsButton = BaseProps & Omit<ComponentProps<"button">, keyof BaseProps> & { href?: undefined };
type ButtonAsLink = BaseProps & Omit<ComponentProps<typeof Link>, keyof BaseProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Brand button: color fill wipes in from the bottom and the label rolls
 * on hover (transform only). Optional magnetic pull.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", magnetic, icon, fullWidth, className, children, cursor, ...rest } = props;

  const classes = cn(
    "group/btn relative isolate inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-semibold tracking-tight",
    "transition-[color,background-color,border-color,opacity] duration-300 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );

  const inner = (
    <>
      <span
        aria-hidden
        className="absolute inset-0 -z-10 origin-bottom scale-y-0 rounded-[inherit] bg-[var(--fill)] transition-transform duration-500 ease-[var(--tp-ease-out)] group-hover/btn:scale-y-100"
      />
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-[var(--tp-ease-out)] group-hover/btn:-translate-y-full">
          {children}
        </span>
        <span
          aria-hidden
          className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--tp-ease-out)] group-hover/btn:translate-y-0"
        >
          {children}
        </span>
      </span>
      {icon && (
        <span className="relative inline-flex transition-transform duration-500 ease-[var(--tp-ease-out)] group-hover/btn:translate-x-1">
          {icon}
        </span>
      )}
    </>
  );

  const element =
    "href" in rest && rest.href !== undefined ? (
      <Link {...(rest as Omit<ButtonAsLink, keyof BaseProps>)} data-cursor={cursor} className={classes}>
        {inner}
      </Link>
    ) : (
      <button
        type="button"
        {...(rest as Omit<ButtonAsButton, keyof BaseProps>)}
        data-cursor={cursor}
        className={classes}
      >
        {inner}
      </button>
    );

  if (!magnetic) return element;
  return <Magnetic className={fullWidth ? "w-full" : undefined}>{element}</Magnetic>;
}
