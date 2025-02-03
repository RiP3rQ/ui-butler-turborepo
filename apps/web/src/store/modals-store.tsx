import { create } from "zustand";
import { Project } from "@shared/types";

interface ModalsStoreState {
  projectModal: {
    data: Project | null;
    setData: (data: Project) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    mode: "create" | "edit";
    setMode: (mode: "create" | "edit") => void;
  };
  createNewComponentModal: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    code: string;
    setCode: (code: string) => void;
  };
}

export const useModalsStateStore = create<ModalsStoreState>((set) => ({
  projectModal: {
    data: null,
    setData: (data) => {
      set((state) => ({
        projectModal: {
          ...state.projectModal,
          data,
        },
      }));
    },
    isOpen: false,
    setIsOpen: (isOpen) => {
      set((state) => ({
        projectModal: {
          ...state.projectModal,
          isOpen,
        },
      }));
    },
    mode: "create",
    setMode: (mode) => {
      set((state) => ({
        projectModal: {
          ...state.projectModal,
          mode,
        },
      }));
    },
  },
  createNewComponentModal: {
    isOpen: false,
    setIsOpen: (isOpen) => {
      set((state) => ({
        createNewComponentModal: {
          ...state.createNewComponentModal,
          isOpen,
        },
      }));
    },
    code: "",
    setCode: (code) => {
      set((state) => ({
        createNewComponentModal: {
          ...state.createNewComponentModal,
          code,
        },
      }));
    },
  },
}));
