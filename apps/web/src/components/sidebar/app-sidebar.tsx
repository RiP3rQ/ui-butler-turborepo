"use client";

import * as React from "react";
import { useMemo } from "react";
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui/components/ui/sidebar";
import type { BundlesType, ProjectType } from "@repo/types";
import { SidebarMainContent } from "@/components/sidebar/sidebar-main-content";
import { SidebarFooterContent } from "@/components/sidebar/sidebar-footer-content";
import { SavedBundles } from "@/components/sidebar/saved-components-bundles";
import { CustomSidebarHeader } from "@/components/sidebar/sidebar-header";

// This is sample data.
const data = {
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
      items: [],
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
      name: "Dummy Data 1",
      url: "#",
      icon: Frame,
    },
    {
      name: "Dummy Data 2",
      url: "#",
      icon: VercelLogoIcon,
    },
    {
      name: "Dummy Data 3",
      url: "#",
      icon: Map,
    },
  ],
};

interface AdditionalAppSidebarProps {
  userProjects: ProjectType[];
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & AdditionalAppSidebarProps) {
  const { userProjects, ...slicedProps } = props;

  const mainContentData = useMemo(() => {
    const filteredNavMain = data.navMain.filter(
      (item) => item.title !== "Projects",
    );
    const projectsItem = {
      title: "Projects",
      url: "#",
      icon: Bot,
      items: userProjects.map((project) => ({
        title: project.title,
        url: `/projects/${String(project.id)}`,
        color: project.color,
      })),
    };
    filteredNavMain.splice(3, 0, projectsItem);
    return filteredNavMain;
  }, [userProjects]);

  return (
    <Sidebar collapsible="icon" {...slicedProps}>
      <SidebarHeader>
        <CustomSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMainContent items={mainContentData} />
        <SavedBundles bundles={data.savedBundles as BundlesType[]} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterContent />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
