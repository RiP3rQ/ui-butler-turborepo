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
  items?: {
    title: string;
    url: string;
    icon?: LucideIcon;
    color?: string;
    actions: {
      icon: LucideIcon;
      tooltipInfo: string;
      action: () => void;
    }[];
  }[];
}
