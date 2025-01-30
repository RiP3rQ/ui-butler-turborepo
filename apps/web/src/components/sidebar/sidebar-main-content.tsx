"use client";

import { ChevronRight } from "lucide-react";
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
import { TooltipWrapper } from "@shared/ui/components/tooltip-wrapper";
import { cn } from "@shared/ui/lib/utils";
import type { NavMainType } from "@shared/types";
import type { JSX } from "react";

/**
 * Props for the SidebarMainContent component
 * @interface SidebarMainContentProps
 * @property {NavMainType[]} items - Array of navigation items
 */
interface SidebarMainContentProps {
  items: NavMainType[];
}

/**
 * SidebarMainContent component renders the main content of the sidebar
 * @param {SidebarMainContentProps} props - Component props
 * @returns {JSX.Element} Rendered sidebar main content
 */
export function SidebarMainContent({
  items,
}: Readonly<SidebarMainContentProps>): JSX.Element {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <Separator />
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

/**
 * Props for the CollapsibleMenuItem component
 * @interface CollapsibleMenuItemProps
 * @property {NavMainType} item - Navigation item
 */
interface CollapsibleMenuItemProps {
  item: Readonly<NavMainType>;
}

/**
 * CollapsibleMenuItem component renders a collapsible menu item
 * @param {CollapsibleMenuItemProps} props - Component props
 * @returns {JSX.Element} Rendered collapsible menu item
 */
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
              "hover:bg-muted-foreground transition-colors",
              item.url === currentRoute && "bg-muted-foreground hover:bg-muted",
            )}
            tooltip={item.title}
          >
            {item.icon && <item.icon className="size-5 mr-2" />}
            <span className="flex-grow">{item.title}</span>
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
                    "hover:bg-muted-foreground transition-colors",
                    subItem.url === currentRoute &&
                      "bg-muted-foreground hover:bg-muted",
                  )}
                >
                  <Link
                    href={subItem.url}
                    className="flex items-center justify-between w-full"
                  >
                    <div className="flex items-center">
                      {subItem.icon && <subItem.icon className="size-4 mr-2" />}
                      {subItem.color && (
                        <div
                          className="size-3 rounded-full mr-2"
                          style={{ backgroundColor: subItem.color }}
                        />
                      )}
                      <span>{subItem.title}</span>
                    </div>
                    <div className="flex gap-1 items-center">
                      {subItem.actions?.map((action, index) => (
                        <TooltipWrapper
                          key={index}
                          content={action.tooltipInfo}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              action.action();
                            }}
                          >
                            <action.icon className="size-4" />
                          </Button>
                        </TooltipWrapper>
                      ))}
                    </div>
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

/**
 * Props for the NonCollapsibleMenuItem component
 * @interface NonCollapsibleMenuItemProps
 * @property {NavMainType} item - Navigation item
 */
interface NonCollapsibleMenuItemProps {
  item: Readonly<NavMainType>;
}

/**
 * NonCollapsibleMenuItem component renders a non-collapsible menu item
 * @param {NonCollapsibleMenuItemProps} props - Component props
 * @returns {JSX.Element} Rendered non-collapsible menu item
 */
function NonCollapsibleMenuItem({
  item,
}: NonCollapsibleMenuItemProps): JSX.Element {
  const { currentRoute } = useSidebar();

  return (
    <SidebarMenuItem>
      <Link href={item.url} passHref>
        <SidebarMenuButton
          className={cn(
            "hover:bg-muted-foreground transition-colors",
            item.url === currentRoute && "bg-muted-foreground hover:bg-muted",
          )}
          tooltip={item.title}
        >
          {item.icon && <item.icon className="size-5 mr-2" />}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}
