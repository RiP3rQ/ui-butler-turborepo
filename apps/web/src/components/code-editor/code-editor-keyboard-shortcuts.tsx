"use client";

import { useEffect } from "react";
import { useCodeEditorStore } from "@/store/code-editor-store";

export function CodeEditorKeyboardShortcuts(): null {
  const { clearAllPendingChanges } = useCodeEditorStore();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        clearAllPendingChanges();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [clearAllPendingChanges]);

  return null;
}
