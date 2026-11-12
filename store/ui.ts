"use client";

import { create } from "zustand";

interface UiState {
  /** True once the intro preloader has finished (or was skipped). */
  introDone: boolean;
  /** Persisted cart has been rehydrated from localStorage. */
  cartHydrated: boolean;
  menuOpen: boolean;
  setIntroDone: () => void;
  setCartHydrated: () => void;
  setMenuOpen: (open: boolean) => void;
}

export const useUi = create<UiState>()((set) => ({
  introDone: false,
  cartHydrated: false,
  menuOpen: false,
  setIntroDone: () => set({ introDone: true }),
  setCartHydrated: () => set({ cartHydrated: true }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}));
