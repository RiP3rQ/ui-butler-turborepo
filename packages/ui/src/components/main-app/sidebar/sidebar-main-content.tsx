"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@repo/ui/components/ui/sidebar";
import { Separator } from "@repo/ui/components/ui/separator.tsx";
import type { NavMainType } from "@repo/ui/types/sidebar.ts";
import { cn } from "@repo/ui/lib/utils.ts";

interface NavMainProps {
  items: NavMainType[];
}

export function SidebarMainContent({
  items,
}: Readonly<NavMainProps>): JSX.Element {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <Separator />
      <SidebarMenu>
        {items.map((item, index) => {
          if (item.items && item.items.length > 0) {
            return <CollapsibleMenuItem item={item} key={item.title + index} />;
          }
          return (
            <NonCollapsibleMenuItem item={item} key={item.title + index} />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function CollapsibleMenuItem({
  item,
}: {
  item: Readonly<NavMainType>;
}): JSX.Element {
  const { currentRoute } = useSidebar();

  return (
    <Collapsible
      asChild
      className="group/collapsible"
      defaultOpen={item.isActive}
      key={item.title}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={cn(
              "hover:bg-muted-foreground",
              item.url === currentRoute && "bg-muted-foreground hover:bg-muted",
            )}
            tooltip={item.title}
          >
            {item.icon ? <item.icon /> : null}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  className={cn(
                    "hover:bg-muted-foreground",
                    subItem.url === currentRoute &&
                      "bg-muted-foreground hover:bg-muted",
                  )}
                >
                  <Link href={subItem.url}>
                    <subItem.icon className="size-3" />
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function NonCollapsibleMenuItem({
  item,
}: {
  item: Readonly<NavMainType>;
}): JSX.Element {
  const { currentRoute } = useSidebar();

  return (
    <SidebarMenuItem>
      <Link href={item.url}>
        <SidebarMenuButton
          className={cn(
            "hover:bg-muted-foreground",
            item.url === currentRoute && "bg-muted-foreground hover:bg-muted",
          )}
          tooltip={item.title}
        >
          {item.icon ? <item.icon /> : null}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}
