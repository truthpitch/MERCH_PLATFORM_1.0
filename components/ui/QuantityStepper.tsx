"use client";

import { MinusIcon, PlusIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function QuantityStepper({ value, onChange, min = 1, max = 20, label = "Quantity", size = "md", className }: QuantityStepperProps) {
  const btn = cn(
    "inline-flex items-center justify-center rounded-full transition-colors hover:bg-navy/10 disabled:opacity-30 disabled:hover:bg-transparent",
    size === "sm" ? "h-8 w-8" : "h-11 w-11",
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center rounded-full border border-navy/20 bg-white", size === "sm" ? "p-0.5" : "p-1", className)}
    >
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Decrease ${label.toLowerCase()}`}>
        <MinusIcon size={size === "sm" ? 14 : 18} />
      </button>
      <output aria-live="polite" className={cn("text-center font-semibold tabular-nums", size === "sm" ? "w-7 text-sm" : "w-10")}>
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Increase ${label.toLowerCase()}`}>
        <PlusIcon size={size === "sm" ? 14 : 18} />
      </button>
    </div>
  );
}
