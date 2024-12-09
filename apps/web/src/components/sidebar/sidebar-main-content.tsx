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
import { Separator } from "@repo/ui/components/ui/separator";
import type { NavMainType } from "@repo/types";
import { cn } from "@repo/ui/lib/utils";

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
        {items.map((item) => {
          if (item.items && item.items.length > 0) {
            return <CollapsibleMenuItem item={item} key={item.title} />;
          }
          return <NonCollapsibleMenuItem item={item} key={item.title} />;
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
      defaultOpen={
        item.isActive ?? item.items?.some((i) => i.url === currentRoute)
      }
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
                    {subItem.icon ? <subItem.icon className="size-3" /> : null}
                    {subItem.color ? (
                      <div
                        className="size-3 rounded-full bg-primary"
                        style={{
                          backgroundColor: subItem.color ?? "transparent",
                        }}
                      />
                    ) : null}
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
  // TODO: SEARCHPARAMS -> get 1 level deep item from the url

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
