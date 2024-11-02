"use client";

import * as React from "react";
import {
  AirplayIcon,
  BookOpen,
  Bot,
  CircleMinusIcon,
  ComponentIcon,
  DollarSignIcon,
  Frame,
  HistoryIcon,
  Map,
  PaperclipIcon,
  PenIcon,
  SaveIcon,
  Settings,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import { VercelLogoIcon } from "@radix-ui/react-icons";
import { NavMain } from "@repo/ui/components/main-app/sidebar/nav-main";
import { NavUser } from "@repo/ui/components/main-app/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui/components/ui/sidebar";
import { SavedBundles } from "@repo/ui/components/main-app/sidebar/saved-components-bundles.tsx";
import type { BundlesType } from "@repo/ui/components/main-app/sidebar/types.ts";
import { CustomSidebarHeader } from "@repo/ui/components/main-app/sidebar/sidebar-header.tsx";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Save new component",
      url: "/save-new-component",
      icon: ComponentIcon,
      isActive: false,
    },
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: false,
      items: [
        {
          title: "History",
          url: "#",
          icon: HistoryIcon,
        },
        {
          title: "Saved",
          url: "#",
          icon: SaveIcon,
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
      title: "Settings & Changelog",
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
          title: "Limits",
          url: "#",
          icon: CircleMinusIcon,
        },
        {
          title: "Changelog",
          url: "#",
          icon: BookOpen,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CustomSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <SavedBundles bundles={data.savedBundles as BundlesType[]} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
