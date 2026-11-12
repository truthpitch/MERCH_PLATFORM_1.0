"use client";

import { useId, useState, type ReactNode } from "react";
import { PlusIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  question: string;
  answer: ReactNode;
}

/** WAI-ARIA accordion. Height animates with the grid 0fr→1fr technique. */
export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className={cn("divide-y divide-navy/15 border-y border-navy/15", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${baseId}-b${i}`;
        const panelId = `${baseId}-p${i}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left text-base font-semibold sm:text-lg"
              >
                {item.question}
                <span
                  className={cn(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-navy/20 transition-transform duration-500 ease-[var(--tp-ease-out)]",
                    isOpen && "rotate-45 bg-navy text-white",
                  )}
                >
                  <PlusIcon size={18} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--tp-ease-out)]",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
              inert={!isOpen}
            >
              <div className="overflow-hidden">
                <div className="max-w-2xl pb-6 pr-12 text-muted">{item.answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
