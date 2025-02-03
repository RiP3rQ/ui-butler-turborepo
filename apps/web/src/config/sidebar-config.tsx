import {
  AirplayIcon,
  AreaChartIcon as ChartAreaIcon,
  ComponentIcon,
  PuzzleIcon,
  SquareTerminal,
  VariableIcon,
} from "lucide-react";
import type { NavMainType } from "@shared/types";

/**
 * SidebarOptions object containing the main navigation items
 */
export const SidebarOptions: { navMain: NavMainType[] } = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: AirplayIcon,
      isActive: false,
    },
    {
      title: "Analytics dashboard",
      url: "/analytics-dashboard",
      icon: ChartAreaIcon,
      isActive: false,
    },
    {
      title: "Generate new component",
      url: "/generate-component",
      icon: PuzzleIcon,
      isActive: false,
    },
    {
      title: "Save component",
      url: "/save-component",
      icon: ComponentIcon,
      isActive: false,
    },
    {
      title: "Workflows",
      url: "/workflows-list",
      icon: SquareTerminal,
      isActive: false,
    },
    {
      title: "Credentials",
      url: "/credentials",
      icon: VariableIcon,
      isActive: false,
    },
  ],
};
