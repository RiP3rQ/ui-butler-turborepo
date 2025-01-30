"use client";

import React, { JSX, useMemo } from "react"; // Import React
import { SidebarFooterContent } from "@/components/sidebar/sidebar-footer-content";
import { CustomSidebarHeader } from "@/components/sidebar/sidebar-header";
import { SidebarMainContent } from "@/components/sidebar/sidebar-main-content";
import type { Project } from "@shared/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@shared/ui/components/ui/sidebar";
import { Bot, EditIcon, Trash2Icon } from "lucide-react";
import { SidebarOptions } from "@/config/sidebar-config";

/**
 * Props for the AppSidebar component
 * @interface AppSidebarProps
 * @extends {React.ComponentProps<typeof Sidebar>}
 * @property {Project[]} userProjects - Array of user projects
 */
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userProjects: Project[];
}

/**
 * AppSidebar component renders the main sidebar of the application
 * @param {AppSidebarProps} props - Component props
 * @returns {JSX.Element} Rendered app sidebar
 */
export function AppSidebar({
  userProjects,
  ...props
}: Readonly<AppSidebarProps>): JSX.Element {
  const mainContentData = useMemo(() => {
    const filteredNavMain = SidebarOptions.navMain.filter(
      (item) => item.title !== "Projects",
    );
    const projectsItem = {
      title: "Projects",
      url: "#",
      icon: Bot,
      items: userProjects.map((project) => ({
        title: project.title,
        url: `/projects/${project.id}`,
        color: project.color,
        actions: [
          {
            icon: EditIcon,
            tooltipInfo: `Edit ${project.title}`,
            action: () => {
              console.log(`Edit project: ${project.title}`);
            },
          },
          {
            icon: Trash2Icon,
            tooltipInfo: `Delete ${project.title}`,
            action: () => {
              console.log(`Delete project: ${project.title}`);
            },
          },
        ],
      })),
    };
    filteredNavMain.splice(3, 0, projectsItem);
    return filteredNavMain;
  }, [userProjects]);

  return (
    <Sidebar collapsible="icon" {...props}>
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
