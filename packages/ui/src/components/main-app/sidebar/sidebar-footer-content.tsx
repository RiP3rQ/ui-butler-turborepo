"use client";

import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui/components/ui/sidebar";
import { logoutUser } from "@repo/ui/actions/auth/logoutUser.ts";
import type { BasicUser } from "@repo/ui/types/users.ts";

interface SidebarFooterContentProps {
  currentLoggedUser: BasicUser;
}

export function SidebarFooterContent({
  currentLoggedUser,
}: Readonly<SidebarFooterContentProps>) {
  const { isMobile } = useSidebar();

  async function handleUserLogout() {
    await logoutUser();
    toast.success("You have been logged out.");
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  alt={currentLoggedUser.username}
                  src={currentLoggedUser.avatar}
                />
                <AvatarFallback className="rounded-lg">
                  {currentLoggedUser.username.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentLoggedUser.username}
                </span>
                <span className="truncate text-xs">
                  {currentLoggedUser.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    alt={currentLoggedUser.username}
                    src={currentLoggedUser.avatar}
                  />
                  <AvatarFallback className="rounded-lg">
                    {currentLoggedUser.username.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {currentLoggedUser.username}
                  </span>
                  <span className="truncate text-xs">
                    {currentLoggedUser.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              {/*<DropdownMenuItem>*/}
              {/*  <Bell />*/}
              {/*  Notifications*/}
              {/*</DropdownMenuItem>*/}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleUserLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
