"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterPanel } from "@/components/shop/FilterPanel";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { CloseIcon, FilterIcon } from "@/components/ui/Icons";
import { applyFilters, CATEGORY_LABELS, isCategory, isSort, SIZE_ORDER, SORT_OPTIONS } from "@/lib/filters";
import { EASE_OUT } from "@/lib/motion";
import { cn, formatPrice } from "@/lib/utils";
import type { FilterOptions, Product, ProductCategory, ProductFilters, ProductSize, ProductSort } from "@/types";

interface ShopViewProps {
  products: Product[];
  options: FilterOptions;
}

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

/**
 * Client-side filtering over the products the server provided. Filters
 * live in the URL (shareable, back-button friendly) and are written with
 * history.replaceState, which Next.js syncs into useSearchParams without
 * a server round-trip. Phase 2 can move filtering into getProducts().
 */
export function ShopView({ products, options }: ShopViewProps) {
  const params = useSearchParams();
  const [panelOpen, setPanelOpen] = useState(false);

  const category = isCategory(params.get("category")) ? (params.get("category") as ProductCategory) : null;
  const sort: ProductSort = isSort(params.get("sort")) ? (params.get("sort") as ProductSort) : "featured";
  const sizes = list(params.get("size")).filter((s): s is ProductSize => (SIZE_ORDER as string[]).includes(s));
  const colors = list(params.get("color"));
  const maxRaw = Number(params.get("max"));
  const maxPrice = Number.isFinite(maxRaw) && maxRaw > 0 ? maxRaw : null;

  const filters: ProductFilters = { category, sizes, colors, maxPrice, sort };
  // Small catalog: filtering on every render is cheap (and compiler-memoized).
  const results = applyFilters(products, filters);

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `/shop?${qs}` : "/shop");
  };

  const toggle = (key: "size" | "color", current: string[], value: string) => {
    const nextList = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update({ [key]: nextList.join(",") || null });
  };

  const activeChips = [
    ...sizes.map((s) => ({ key: `size-${s}`, label: `Size ${s}`, remove: () => toggle("size", sizes, s) })),
    ...colors.map((c) => ({ key: `color-${c}`, label: c, remove: () => toggle("color", colors, c) })),
    ...(maxPrice ? [{ key: "max", label: `Under ${formatPrice(maxPrice, { whole: true })}`, remove: () => update({ max: null }) }] : []),
  ];
  const clearAll = () => update({ size: null, color: null, max: null });

  const panel = (prefix: string) => (
    <FilterPanel
      idPrefix={prefix}
      options={options}
      value={{ sizes, colors, maxPrice }}
      onToggleSize={(s) => toggle("size", sizes, s)}
      onToggleColor={(c) => toggle("color", colors, c)}
      onMaxPrice={(n) => update({ max: n === null ? null : String(n) })}
    />
  );

  const tabs: { value: ProductCategory | null; label: string; count: number }[] = [
    { value: null, label: "All", count: products.length },
    ...options.categories,
  ];

  return (
    <div className="container-tp pb-24 sm:pb-32">
      {/* Category tabs */}
      <LayoutGroup id="shop-tabs">
        <nav aria-label="Categories" className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-1 rounded-full border border-navy/10 bg-white p-1">
            {tabs.map((t) => {
              const active = category === t.value;
              return (
                <li key={t.label}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => update({ category: t.value })}
                    className={cn(
                      "relative inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors sm:px-5",
                      active ? "text-white" : "text-navy hover:text-accent",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="tab-pill"
                        className="absolute inset-0 -z-0 rounded-full bg-navy"
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      />
                    )}
                    <span className="relative">{t.label}</span>
                    <span className={cn("relative text-xs tabular-nums", active ? "text-sand" : "text-muted")}>{t.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </LayoutGroup>

      <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-12">
        {/* Desktop sidebar */}
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-28">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filter</h2>
              {activeChips.length > 0 && (
                <button type="button" onClick={clearAll} className="text-sm text-muted underline-offset-4 hover:text-navy hover:underline">
                  Clear all
                </button>
              )}
            </div>
            {panel("desk")}
          </div>
        </aside>

        <div>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 pb-4">
            <p className="text-sm text-muted" aria-live="polite">
              <span className="font-semibold text-navy tabular-nums">{results.length}</span> {results.length === 1 ? "product" : "products"}
              {category && <> in {CATEGORY_LABELS[category]}</>}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-navy/20 bg-white px-4 text-sm font-semibold lg:hidden"
              >
                <FilterIcon size={18} /> Filters
                {activeChips.length > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs text-white">{activeChips.length}</span>
                )}
              </button>
              <label htmlFor="sort" className="sr-only">
                Sort by
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => update({ sort: e.target.value === "featured" ? null : e.target.value })}
                className="h-10 appearance-none rounded-full border border-navy/20 bg-white bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%230B2545%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pl-4 pr-9 text-sm font-semibold"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active chips */}
          <AnimatePresence initial={false}>
            {activeChips.length > 0 && (
              <motion.ul
                key="chips"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap gap-2 pt-4"
                aria-label="Active filters"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {activeChips.map((chip) => (
                    <motion.li key={chip.key} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                      <button
                        type="button"
                        onClick={chip.remove}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-navy/5 pl-3 pr-2 text-sm font-medium hover:bg-navy/10"
                        aria-label={`Remove filter: ${chip.label}`}
                      >
                        {chip.label}
                        <CloseIcon size={14} />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
          </AnimatePresence>

          {/* Grid */}
          {results.length > 0 ? (
            <motion.ul layout className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 min-[480px]:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((p, i) => (
                  <motion.li
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.55, ease: EASE_OUT, delay: Math.min(i, 8) * 0.03 }}
                  >
                    <ProductCard product={p} priority={i < 3} sizes="(min-width: 1280px) 26vw, (min-width: 480px) 45vw, 100vw" />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-16 rounded-lg border border-dashed border-navy/20 px-6 py-16 text-center">
              <p className="text-3xl font-bold tracking-tight">Nothing matches. Honestly.</p>
              <p className="mt-3 text-muted">Loosen a filter or two and try again.</p>
              <Button className="mt-8" onClick={clearAll} variant="outline">
                Clear filters
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <Dialog
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        variant="right"
        title="Filter"
        footer={
          <div className="grid grid-cols-2 gap-3 px-5 py-4">
            <Button variant="outline" onClick={clearAll}>
              Clear
            </Button>
            <Button onClick={() => setPanelOpen(false)}>Show {results.length}</Button>
          </div>
        }
      >
        <div className="px-5 py-6">{panel("mob")}</div>
      </Dialog>
    </div>
  );
}
