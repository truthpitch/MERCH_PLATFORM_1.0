"use client";

import { CheckIcon } from "@/components/ui/Icons";
import { cn, formatPrice } from "@/lib/utils";
import type { FilterOptions, ProductSize } from "@/types";

export interface ShopFilterState {
  sizes: ProductSize[];
  colors: string[];
  maxPrice: number | null;
}

interface FilterPanelProps {
  options: FilterOptions;
  value: ShopFilterState;
  onToggleSize: (s: ProductSize) => void;
  onToggleColor: (c: string) => void;
  onMaxPrice: (n: number | null) => void;
  idPrefix: string;
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-navy/10 py-6 first:border-t-0 first:pt-0">
      <legend className="eyebrow float-left mb-4 w-full text-navy/70">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

export function FilterPanel({ options, value, onToggleSize, onToggleColor, onMaxPrice, idPrefix }: FilterPanelProps) {
  const max = value.maxPrice ?? options.priceRange.max;
  return (
    <div>
      <Group title="Size">
        <div className="flex flex-wrap gap-2">
          {options.sizes.map((s) => {
            const on = value.sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => onToggleSize(s)}
                className={cn(
                  "h-10 min-w-12 rounded-full border px-3 text-sm font-medium transition-colors",
                  on ? "border-navy bg-navy text-white" : "border-navy/20 bg-white hover:border-navy",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Colour">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {options.colors.map((c) => {
            const on = value.colors.includes(c.name);
            return (
              <button
                key={c.name}
                type="button"
                aria-pressed={on}
                onClick={() => onToggleColor(c.name)}
                className="group flex items-center gap-2.5 rounded-md py-1.5 text-left text-sm"
              >
                <span
                  className={cn(
                    "relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-transform",
                    on ? "scale-110 border-navy ring-2 ring-navy ring-offset-2 ring-offset-paper" : "border-navy/20 group-hover:scale-110",
                  )}
                  style={{ backgroundColor: c.hex }}
                >
                  {on && <CheckIcon size={14} className={["#FFFFFF", "#F2EDE4", "#D9C3A5"].includes(c.hex) ? "text-navy" : "text-white"} />}
                </span>
                <span className={on ? "font-semibold" : undefined}>{c.name}</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Price">
        <label htmlFor={`${idPrefix}-price`} className="flex items-baseline justify-between text-sm">
          <span>Up to</span>
          <span className="font-semibold tabular-nums">{formatPrice(max, { whole: true })}</span>
        </label>
        <input
          id={`${idPrefix}-price`}
          type="range"
          min={options.priceRange.min}
          max={options.priceRange.max}
          step={1}
          value={max}
          onChange={(e) => {
            const n = Number(e.target.value);
            onMaxPrice(n >= options.priceRange.max ? null : n);
          }}
          className="mt-3 w-full accent-[var(--tp-accent)]"
        />
        <div className="mt-1 flex justify-between text-xs text-muted tabular-nums">
          <span>{formatPrice(options.priceRange.min, { whole: true })}</span>
          <span>{formatPrice(options.priceRange.max, { whole: true })}</span>
        </div>
      </Group>
    </div>
  );
}
