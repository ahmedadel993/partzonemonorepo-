"use client";

import { create } from "zustand";
import type { Cart } from "@/modules/cart/types";

interface CartUIState {
  isDrawerOpen: boolean;
  cart: Cart | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setCart: (cart: Cart | null) => void;
  itemCount: () => number;
}

export const useCartStore = create<CartUIState>()((set, get) => ({
  isDrawerOpen: false,
  cart: null,
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),
  setCart: (cart) => set({ cart }),
  itemCount: () => get().cart?.itemCount ?? 0,
}));
