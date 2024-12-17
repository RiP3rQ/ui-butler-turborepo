import { type ReactNode } from "react";
import { create } from "zustand";

interface UseConfirmationModalStoreState {
  isModalOpen: boolean;
  isPending: boolean;
  modalTitle?: string;
  modalSubtitle?: string;
  dialogContent: ReactNode;
  saveButtonText?: string;
  cancelButtonText?: string;
  saveButtonFunction: () => void;
  cancelButtonFunction: () => void;
  saveButtonDisabled: boolean;
}

interface UseConfirmationModalStoreAction {
  setIsModalOpen: (isOpen: boolean) => void;
  setIsPending: (isPending: boolean) => void;
  setModalTitle: (title: string) => void;
  setModalSubtitle: (subtitle: string) => void;
  setDialogContent: (content: ReactNode) => void;
  setSaveButtonText: (text: string) => void;
  setCancelButtonText: (text: string) => void;
  setSaveButtonFunction: (func: () => void) => void;
  setCancelButtonFunction: (func: () => void) => void;
  setSaveButtonDisabled: (disabled: boolean) => void;
  // setter functions for other state variables
  setConfirmationModalBasicState: (
    state: Pick<
      UseConfirmationModalStoreState,
      | "isModalOpen"
      | "modalTitle"
      | "modalSubtitle"
      | "cancelButtonText"
      | "saveButtonText"
      | "saveButtonFunction"
    >,
  ) => void;
}

export const useConfirmationModalStore = create<
  UseConfirmationModalStoreState & UseConfirmationModalStoreAction
>((set) => ({
  // State
  isModalOpen: false,
  isPending: false,
  modalTitle: undefined,
  modalSubtitle: undefined,
  dialogContent: null,
  saveButtonText: undefined,
  cancelButtonText: undefined,
  saveButtonDisabled: false,
  saveButtonFunction: () => {
    // default just closes the modal
    set(() => ({ isModalOpen: false }));
  },
  cancelButtonFunction: () => {
    // default just closes the modal
    set(() => ({ isModalOpen: false }));
    // reset the state
    set(() => ({
      isModalOpen: false,
      isPending: false,
      modalTitle: undefined,
      modalSubtitle: undefined,
      dialogContent: null,
      saveButtonText: undefined,
      cancelButtonText: undefined,
      saveButtonDisabled: false,
    }));
  },
  // Actions
  setIsModalOpen: (isOpen) => {
    set(() => ({ isModalOpen: isOpen }));
  },
  setIsPending: (isPending) => {
    set(() => ({ isPending }));
  },
  setModalTitle: (title) => {
    set(() => ({ modalTitle: title }));
  },
  setModalSubtitle: (subtitle) => {
    set(() => ({ modalSubtitle: subtitle }));
  },
  setDialogContent: (content) => {
    set(() => ({ dialogContent: content }));
  },
  setSaveButtonText: (text) => {
    set(() => ({ saveButtonText: text }));
  },
  setCancelButtonText: (text) => {
    set(() => ({ cancelButtonText: text }));
  },
  setSaveButtonFunction: (func) => {
    set(() => ({ saveButtonFunction: func }));
  },
  setCancelButtonFunction: (func) => {
    set(() => ({ cancelButtonFunction: func }));
  },
  setSaveButtonDisabled: (disabled) => {
    set(() => ({ saveButtonDisabled: disabled }));
  },
  // setter functions for other state variables
  setConfirmationModalBasicState: (state) => {
    set(() => state);
  },
}));
