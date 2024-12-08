import { create } from "zustand";

interface ModalsStoreState {
  createNewProjectModal: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
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
}));
