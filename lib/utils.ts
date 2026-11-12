type ClassValue = string | number | false | null | undefined | ClassValue[];

/** Tiny className joiner (no dependency). */
export function cn(...classes: ClassValue[]): string {
  const out: string[] = [];
  for (const c of classes) {
    if (!c) continue;
    if (Array.isArray(c)) {
      const inner = cn(...c);
      if (inner) out.push(inner);
    } else {
      out.push(String(c));
    }
  }
  return out.join(" ");
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usdWhole = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function formatPrice(value: number, opts: { whole?: boolean } = {}): string {
  if (opts.whole && Number.isInteger(value)) return usdWhole.format(value);
  return usd.format(value);
}

/** Round to cents to avoid float drift in totals. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
