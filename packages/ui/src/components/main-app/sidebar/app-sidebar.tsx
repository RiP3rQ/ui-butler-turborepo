"use client";

import * as React from "react";
import {
  AirplayIcon,
  Bot,
  ChartAreaIcon,
  ComponentIcon,
  DollarSignIcon,
  Frame,
  HistoryIcon,
  Map,
  PaperclipIcon,
  PenIcon,
  Settings,
  Settings2,
  SquareTerminal,
  VariableIcon,
} from "lucide-react";
import { VercelLogoIcon } from "@radix-ui/react-icons";
import { SidebarMainContent } from "@repo/ui/components/main-app/sidebar/sidebar-main-content.tsx";
import { SidebarFooterContent } from "@repo/ui/components/main-app/sidebar/sidebar-footer-content.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui/components/ui/sidebar";
import { SavedBundles } from "@repo/ui/components/main-app/sidebar/saved-components-bundles.tsx";
import { CustomSidebarHeader } from "@repo/ui/components/main-app/sidebar/sidebar-header.tsx";
import type { BundlesType } from "@repo/ui/types/sidebar.ts";
import type { BasicUser } from "@repo/ui/types/users.ts";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Analytics dashboard",
      url: "/dashboard",
      icon: ChartAreaIcon,
      isActive: true,
    },
    {
      title: "Create new component",
      url: "/create-new-component",
      icon: ComponentIcon,
      isActive: false,
    },
    {
      title: "Workflows",
      url: "/workflows",
      icon: SquareTerminal,
      isActive: false,
      items: [
        {
          title: "Create new workflow",
          url: "/create-new-workflow",
          icon: PenIcon,
        },
        {
          title: "Workflows list",
          url: "/workflows-list",
          icon: PaperclipIcon,
        },
        {
          title: "History",
          url: "#",
          icon: HistoryIcon,
        },
      ],
    },
    {
      title: "Projects",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Test Project",
          url: "#",
          icon: PenIcon,
        },
        {
          title: "Test Project 2",
          url: "#",
          icon: PaperclipIcon,
        },
        {
          title: "Test Project 3",
          url: "#",
          icon: AirplayIcon,
        },
      ],
    },
    {
      title: "Settings & Variables",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
          icon: Settings,
        },
        {
          title: "Billing",
          url: "#",
          icon: DollarSignIcon,
        },
        {
          title: "Variables",
          url: "#",
          icon: VariableIcon,
        },
      ],
    },
  ],
  savedBundles: [
    {
      name: "Shadcn _components",
      url: "#",
      icon: Frame,
    },
    {
      name: "Vercel _components",
      url: "#",
      icon: VercelLogoIcon,
    },
    {
      name: "Black&White _components",
      url: "#",
      icon: Map,
    },
  ],
};

interface AdditionalAppSidebarProps {
  currentLoggedUser: BasicUser;
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & AdditionalAppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CustomSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMainContent items={data.navMain} />
        <SavedBundles bundles={data.savedBundles as BundlesType[]} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterContent currentLoggedUser={props.currentLoggedUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
