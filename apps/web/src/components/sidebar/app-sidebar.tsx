"use client";

import { SidebarFooterContent } from "@/components/sidebar/sidebar-footer-content";
import { CustomSidebarHeader } from "@/components/sidebar/sidebar-header";
import { SidebarMainContent } from "@/components/sidebar/sidebar-main-content";
import { type Project } from "@shared/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@shared/ui/components/ui/sidebar";
import {
  AirplayIcon,
  Bot,
  ChartAreaIcon,
  ComponentIcon,
  PuzzleIcon,
  SquareTerminal,
  VariableIcon,
} from "lucide-react";
import { useMemo, type JSX } from "react";

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
      title: "Projects",
      url: "#",
      icon: Bot,
    },
    {
      title: "Credentials",
      url: "/credentials",
      icon: VariableIcon,
    },
  ],
};

interface AdditionalAppSidebarProps {
  userProjects: Project[];
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> &
  AdditionalAppSidebarProps): JSX.Element {
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
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterContent />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
