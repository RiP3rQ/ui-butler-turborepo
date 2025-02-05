import type { LucideIcon } from "lucide-react";

export interface BundlesType {
  name: string;
  url: string;
  icon: LucideIcon;
}

export interface NavMainType {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  action?: () => void;
  items?: {
    title: string;
    url: string;
    icon?: LucideIcon;
    color?: string;
    actions: SubItemActionType[];
  }[];
}

export type SubItemActionType = {
  icon: LucideIcon;
  tooltipInfo: string;
  action: () => void;
};
