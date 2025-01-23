"use client";

import { type FavoritedComponent } from "@shared/types";
import { Button } from "@shared/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { type Row } from "@tanstack/react-table";
import {
  HeartOffIcon,
  MoreHorizontal,
  SquareArrowUpRightIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type JSX } from "react";

export function ActionsTableColumns({
  row,
}: {
  row: Row<FavoritedComponent>;
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
