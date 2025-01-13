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
import { logoutUser } from "@repo/ui/actions/auth/logout-user";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { type JSX } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";

export function SidebarFooterContent(): JSX.Element {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { user, isLoading } = useCurrentUser();

  async function handleUserLogout(): Promise<void> {
    await logoutUser();
    toast.success("You have been logged out.");
  }

  if (isLoading || !user) {
    return <Skeleton className="w-[180px] h-[40px]" />;
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
                <AvatarImage alt={user.username} src={user.avatar} />
                <AvatarFallback className="rounded-lg">
                  {user.username.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.username}</span>
                <span className="truncate text-xs">{user.email}</span>
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
                  <AvatarImage alt={user.username} src={user.avatar} />
                  <AvatarFallback className="rounded-lg">
                    {user.username.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.username}
                  </span>
                  <span className="truncate text-xs">{user.email}</span>
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
              <DropdownMenuItem
                onClick={() => {
                  router.push("/billing");
                }}
              >
                <CreditCard />
                Billing
              </DropdownMenuItem>
              {/*<DropdownMenuItem>*/}
              {/*  <Bell />*/}
              {/*  Notifications*/}
              {/*</DropdownMenuItem>*/}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleUserLogout()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
