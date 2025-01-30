import { create } from "zustand";

interface CodeEditorState {
  pendingChanges: Record<string, string>;
  setPendingChange: (codeType: string, code: string) => void;
  clearPendingChange: (codeType: string) => void;
  clearAllPendingChanges: () => void;
  hasPendingChange: (codeType: string) => boolean;
}

export const useCodeEditorStore = create<CodeEditorState>((set, get) => ({
  pendingChanges: {},
  setPendingChange: (codeType, code) => {
    set((state) => ({
      pendingChanges: { ...state.pendingChanges, [codeType]: code },
    }));
  },
  clearPendingChange: (codeType) => {
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [codeType]: _, ...rest } = state.pendingChanges;
      return { pendingChanges: rest };
    });
  },
  clearAllPendingChanges: () => {
    set({ pendingChanges: {} });
  },
  hasPendingChange: (codeType) => {
    const state = get();
    return codeType in state.pendingChanges;
  },
}));
