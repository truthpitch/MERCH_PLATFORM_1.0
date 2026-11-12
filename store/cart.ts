"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { roundMoney } from "@/lib/utils";
import type { CartItem } from "@/types";

const MAX_QTY = 20;

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /** Bumps on every add — drives the cart icon pulse + drawer highlight. */
  lastAddedId: string | null;
  addPulse: number;

  addItem: (item: Omit<CartItem, "id" | "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      lastAddedId: null,
      addPulse: 0,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const id = item.variantId;
          const existing = state.items.find((i) => i.id === id);
          const items = existing
            ? state.items.map((i) => (i.id === id ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) } : i))
            : [...state.items, { ...item, id, quantity: Math.min(MAX_QTY, quantity) }];
          return { items, lastAddedId: id, addPulse: state.addPulse + 1, isOpen: true };
        }),

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      setQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity: Math.min(MAX_QTY, quantity) } : i)),
        })),

      clear: () => set({ items: [], lastAddedId: null }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: "truthpitch-cart",
      version: 1,
      // window.* so the server never touches Node's experimental localStorage global.
      storage: createJSONStorage(() => (typeof window === "undefined" ? (undefined as never) : window.localStorage)),
      // Only persist the lines — UI state resets per visit.
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
);

export const MAX_LINE_QTY = MAX_QTY;

export function selectItemCount(state: Pick<CartState, "items">): number {
  return state.items.reduce((n, i) => n + i.quantity, 0);
}

export function selectSubtotal(state: Pick<CartState, "items">): number {
  return roundMoney(state.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
}
