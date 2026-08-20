import { create } from "zustand";

export const useTransaccionesFilters = create((set) => ({
  filters: undefined,
  setFilters: (filters) => set({ filters }),
}));
