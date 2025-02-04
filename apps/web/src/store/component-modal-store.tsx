import { create } from "zustand";

interface ComponentModalState {
  isOpen: boolean;
  code: string;
  open: () => void;
  close: () => void;
  setCode: (code: string) => void;
  reset: () => void;
}

const initialState: Omit<
  ComponentModalState,
  "open" | "close" | "setCode" | "reset"
> = {
  isOpen: false,
  code: "",
};

export const useComponentModalStore = create<ComponentModalState>((set) => ({
  ...initialState,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setCode: (code: string) => set({ code }),
  reset: () => set(initialState),
}));
