"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { getSizeChart } from "@/lib/size-guide";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/types";

export function SizeGuide({ open, onClose, category }: { open: boolean; onClose: () => void; category: ProductCategory }) {
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const chart = getSizeChart(category);

  return (
    <Dialog open={open} onClose={onClose} title="Size guide">
      <div className="px-5 py-6 sm:px-6">
        {chart ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-2xl font-bold tracking-tight">{chart.title}</h3>
              <div role="radiogroup" aria-label="Units" className="inline-flex rounded-full border border-navy/15 bg-white p-1 text-sm font-semibold">
                {(["in", "cm"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    role="radio"
                    aria-checked={unit === u}
                    onClick={() => setUnit(u)}
                    className={cn("h-8 rounded-full px-4 transition-colors", unit === u ? "bg-navy text-white" : "hover:bg-navy/5")}
                  >
                    {u === "in" ? "Inches" : "CM"}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">{chart.note}</p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <caption className="sr-only">
                  {chart.title} measurements in {unit === "in" ? "inches" : "centimetres"}
                </caption>
                <thead>
                  <tr className="border-b border-navy/15">
                    <th scope="col" className="py-3 pr-4 font-semibold">
                      Size
                    </th>
                    {chart.columns.map((c) => (
                      <th key={c} scope="col" className="py-3 pr-4 font-semibold">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chart.rows.map((r) => (
                    <tr key={r.size} className="border-b border-navy/10 last:border-0">
                      <th scope="row" className="py-3 pr-4 font-semibold">
                        {r.size}
                      </th>
                      {r.values.map(([inch, cm], i) => (
                        <td key={i} className="py-3 pr-4 tabular-nums text-navy/80">
                          {unit === "in" ? inch : cm}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div>
            <h3 className="text-2xl font-bold tracking-tight">One size</h3>
            <p className="mt-3 text-muted">
              Caps have an adjustable strap and fit head sizes 54–61cm (21¼–24in). Bags, mugs and bottles — well, they fit everyone.
            </p>
          </div>
        )}
        <div className="mt-8 rounded-lg bg-sand-200 p-5 text-sm">
          <p className="font-semibold">Still unsure?</p>
          <p className="mt-1 text-navy/75">
            Measure a tee you love, lay it flat and compare. Wrong size? Exchanges are free within 30 days.
          </p>
        </div>
      </div>
    </Dialog>
  );
}
