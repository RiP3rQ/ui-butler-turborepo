import { create } from "zustand";
import { Project } from "@shared/types";

interface ProjectModalState {
  // state
  isOpen: boolean;
  data?: Project;
  mode: "create" | "edit";
  code: string;
  queryKey?: string;

  // actions
  open: () => void;
  close: () => void;
  reset: () => void;
  setData: (data: Project) => void;
  setMode: (mode: "create" | "edit") => void;
  setCode: (code: string) => void;
  setQueryKey: (queryKey: string) => void;
}

const initialState: Omit<
  ProjectModalState,
  "open" | "close" | "setData" | "setMode" | "setCode" | "reset" | "setQueryKey"
> = {
  isOpen: false,
  data: undefined,
  mode: "create",
  code: "",
  queryKey: "",
};

export const useProjectModalStore = create<ProjectModalState>((set) => ({
  ...initialState,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  reset: () => set(initialState),
  setData: (data: Project) => set({ data }),
  setMode: (mode: "create" | "edit") => set({ mode }),
  setCode: (code: string) => set({ code }),
  setQueryKey: (queryKey: string) => set({ queryKey }),
}));
