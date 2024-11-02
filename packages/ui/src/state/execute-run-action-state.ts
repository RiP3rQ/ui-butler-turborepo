import type { StoreApi, UseBoundStore } from "zustand";
import { create } from "zustand";

interface State {
  isOpen: boolean;
  actionTitle: string;
  actionSubTitle: string;
  actionButtonTitle: string;
  actionButtonOnClickHandler: () => void;
  closeButtonTitle: string;
  closeButtonOnClickHandler: () => void;
}

interface Action {
  updateIsOpen: (isOpen: State["isOpen"]) => void;
  updateActionTitle: (actionTitle: State["actionTitle"]) => void;
  updateActionSubTitle: (actionSubTitle: State["actionSubTitle"]) => void;
  updateActionButtonTitle: (
    actionButtonTitle: State["actionButtonTitle"],
  ) => void;
  updateActionButtonOnClickHandler: (
    actionButtonOnClickHandler: State["actionButtonOnClickHandler"],
  ) => void;
  updateCloseButtonTitle: (closeButtonTitle: State["closeButtonTitle"]) => void;
  updateCloseButtonOnClickHandler: (
    closeButtonOnClickHandler: State["closeButtonOnClickHandler"],
  ) => void;
}

// Create your store, which includes both state and (optionally) actions
export const useExecuteRunActionDialogState: UseBoundStore<
  StoreApi<State & Action>
> = create<State & Action>((set) => ({
  isOpen: false,
  actionTitle: "",
  actionSubTitle: "",
  actionButtonTitle: "Save",
  actionButtonOnClickHandler: () => {
    alert("Action button clicked");
    set(() => ({ isOpen: false }));
  },
  closeButtonTitle: "Close",
  closeButtonOnClickHandler: () => {
    set(() => ({ isOpen: false }));
  },
  updateIsOpen: (isOpen) => {
    set(() => ({ isOpen }));
  },
  updateActionTitle: (actionTitle) => {
    set(() => ({ actionTitle }));
  },
  updateActionSubTitle: (actionSubTitle) => {
    set(() => ({ actionSubTitle }));
  },
  updateActionButtonTitle: (actionButtonTitle) => {
    set(() => ({ actionButtonTitle }));
  },
  updateActionButtonOnClickHandler: (actionButtonOnClickHandler) => {
    set(() => ({ actionButtonOnClickHandler }));
  },
  updateCloseButtonTitle: (closeButtonTitle) => {
    set(() => ({ closeButtonTitle }));
  },
  updateCloseButtonOnClickHandler: (closeButtonOnClickHandler) => {
    set(() => ({ closeButtonOnClickHandler }));
  },
}));
