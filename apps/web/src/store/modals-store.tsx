import { create } from "zustand";

interface ModalsStoreState {
  createNewProjectModal: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  };
  createNewComponentModal: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    code: string;
    setCode: (code: string) => void;
  };
}

export const useModalsStateStore = create<ModalsStoreState>((set) => ({
  createNewProjectModal: {
    isOpen: false,
    setIsOpen: (isOpen) => {
      set((state) => ({
        createNewProjectModal: {
          ...state.createNewProjectModal,
          isOpen,
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
