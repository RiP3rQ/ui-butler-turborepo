import type { LucideIcon } from "lucide-react";

export interface EditorActionsType {
  title: string;
  icon: LucideIcon;
  function: () => Promise<void> | void;
}
