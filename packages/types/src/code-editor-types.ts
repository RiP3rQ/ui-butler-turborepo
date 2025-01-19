import type { LucideIcon } from "lucide-react";
import {
  type CodeType,
  type SingleComponentApiResponseType,
} from "./components";

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
  getCode: (data: SingleComponentApiResponseType) => string;
  checkImplemented: (data: SingleComponentApiResponseType) => boolean;
  action?: {
    title: string;
    icon: LucideIcon;
  };
}

export interface SingleComponentViewProps {
  componentsData: SingleComponentApiResponseType;
  projectId: string;
  componentId: string;
}
