"use client";

import { type Row } from "@tanstack/react-table";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
  HeartOffIcon,
  MoreHorizontal,
  SquareArrowUpRightIcon,
} from "lucide-react";
import { type DashboardTableFavoritedContentResponse } from "@repo/types";
import { useRouter } from "next/navigation";

export function ActionsTableColumns({
  row,
}: {
  row: Row<DashboardTableFavoritedContentResponse>;
}): JSX.Element {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            // TODO: Unfavourite the component functionality
          }}
        >
          <HeartOffIcon className="mr-2 size-4" />
          Unfavourite
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            router.push(`/component/${String(row.original.id)}`);
          }}
        >
          <SquareArrowUpRightIcon className="mr-2 size-4" />
          Go to component
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
