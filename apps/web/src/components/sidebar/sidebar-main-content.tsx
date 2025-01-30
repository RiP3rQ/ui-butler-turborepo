"use client";

import { ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@shared/ui/components/ui/collapsible";
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
} from "@shared/ui/components/ui/sidebar";
import { Separator } from "@shared/ui/components/ui/separator";
import { Button } from "@shared/ui/components/ui/button";
import { cn } from "@shared/ui/lib/utils";
import { NavMainType, SubItemActionType } from "@shared/types";
import type { JSX } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";

interface SidebarMainContentProps {
  items: NavMainType[];
}

export function SidebarMainContent({
  items,
}: Readonly<SidebarMainContentProps>): JSX.Element {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground">
        Platform
      </SidebarGroupLabel>
      <Separator className="my-2" />
      <SidebarMenu>
        {items.map((item) =>
          item.items && item.items.length > 0 ? (
            <CollapsibleMenuItem item={item} key={item.title} />
          ) : (
            <NonCollapsibleMenuItem item={item} key={item.title} />
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

interface CollapsibleMenuItemProps {
  item: Readonly<NavMainType>;
}

function CollapsibleMenuItem({ item }: CollapsibleMenuItemProps): JSX.Element {
  const { currentRoute } = useSidebar();

  return (
    <Collapsible
      asChild
      className="group/collapsible"
      defaultOpen={
        item.isActive ?? item.items?.some((i) => i.url === currentRoute)
      }
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={cn(
              "w-full justify-between px-3 py-2 transition-colors hover:bg-muted/50",
              item.url === currentRoute && "bg-muted font-medium",
            )}
            tooltip={item.title}
          >
            <div className="flex items-center">
              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
              <span>{item.title}</span>
            </div>
            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem
                key={subItem.title}
                className={"flex items-center justify-between"}
              >
                <SidebarMenuSubButton
                  asChild
                  className={cn(
                    "group flex w-full items-center justify-between px-3 py-2 transition-colors hover:bg-muted/50",
                    subItem.url === currentRoute && "bg-muted font-medium",
                  )}
                >
                  <Link href={subItem.url} className="flex-1">
                    <div className="flex items-center">
                      {subItem.icon && (
                        <subItem.icon className="mr-2 h-3 w-3" />
                      )}
                      {subItem.color && (
                        <div
                          className="mr-2 h-2 w-2 rounded-full"
                          style={{ backgroundColor: subItem.color }}
                        />
                      )}
                      <span className="text-sm">{subItem.title}</span>
                    </div>
                  </Link>
                </SidebarMenuSubButton>
                {subItem.actions && subItem.actions.length > 0 && (
                  <ActionsDropdown actions={subItem.actions} />
                )}
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

interface NonCollapsibleMenuItemProps {
  item: Readonly<NavMainType>;
}

function NonCollapsibleMenuItem({
  item,
}: NonCollapsibleMenuItemProps): JSX.Element {
  const { currentRoute } = useSidebar();

  return (
    <SidebarMenuItem>
      <Link href={item.url} passHref legacyBehavior>
        <SidebarMenuButton
          className={cn(
            "w-full px-3 py-2 transition-colors hover:bg-muted/50",
            item.url === currentRoute && "bg-muted font-medium",
          )}
          tooltip={item.title}
        >
          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}

interface ActionsDropdownProps {
  actions: SubItemActionType[];
}

function ActionsDropdown({ actions }: ActionsDropdownProps): JSX.Element {
  if (!actions) return <></>;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted/50"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={(e) => {
              e.preventDefault();
              action.action();
            }}
          >
            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
            <span>{action.tooltipInfo}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
