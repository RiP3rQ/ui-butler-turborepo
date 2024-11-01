"use client";

import * as React from "react";
import {
  AirplayIcon,
  BookOpen,
  Bot,
  CircleMinusIcon,
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
import Link from "next/link";
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
import Icons from "@repo/ui/components/landing-page/icons.tsx";
import { SavedBundles } from "@repo/ui/components/main-app/sidebar/saved-components-bundles.tsx";
import type { BundlesType } from "@repo/ui/components/main-app/sidebar/types.ts";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
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
      name: "Shadcn components",
      url: "#",
      icon: Frame,
    },
    {
      name: "Vercel components",
      url: "#",
      icon: VercelLogoIcon,
    },
    {
      name: "Black&White components",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-center w-full">
          <Link className="flex items-center gap-2" href="/">
            <Icons.logo className="size-8" />
            <span className="text-lg font-medium">UI-Butler</span>
          </Link>
        </div>
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
