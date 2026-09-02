"use client";

import { create } from "zustand";

interface AuthSheetState {
  open: boolean;
  openSheet: () => void;
  closeSheet: () => void;
}

export const useAuthSheet = create<AuthSheetState>((set) => ({
  open: false,
  openSheet: () => set({ open: true }),
  closeSheet: () => set({ open: false }),
}));
