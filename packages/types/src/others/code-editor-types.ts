import type { LucideIcon } from "lucide-react";
import { type Component } from "../api-client/components-endpoints";
import { type CodeType } from "./code-types";

export interface EditorActionsType {
  title: string;
  icon: LucideIcon;
  function: () => Promise<void> | void;
}

export interface AccordionItemConfig {
  id: string;
  value: string;
  title: string;
  codeType: CodeType;
  getCode: (data: Component) => string;
  checkImplemented: (data: Component) => boolean;
  action?: {
    title: string;
    icon: LucideIcon;
  };
}

export interface SingleComponentViewProps {
  componentsData: Component;
  projectId: string;
  componentId: string;
}
