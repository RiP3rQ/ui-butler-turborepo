import { create } from "zustand";
import { Project } from "@shared/types";

interface ProjectModalState {
  isOpen: boolean;
  data?: Project;
  mode: "create" | "edit";
  code: string;
  open: () => void;
  close: () => void;
  setData: (data: Project) => void;
  setMode: (mode: "create" | "edit") => void;
  setCode: (code: string) => void;
  reset: () => void;
}

const initialState: Omit<
  ProjectModalState,
  "open" | "close" | "setData" | "setMode" | "setCode" | "reset"
> = {
  isOpen: false,
  data: undefined,
  mode: "create",
  code: "",
};

export const useProjectModalStore = create<ProjectModalState>((set) => ({
  ...initialState,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setData: (data: Project) => set({ data }),
  setMode: (mode: "create" | "edit") => set({ mode }),
  setCode: (code: string) => set({ code }),
  reset: () => set(initialState),
}));
