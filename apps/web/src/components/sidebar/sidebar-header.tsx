import Link from "next/link";
import * as React from "react";
import { Icons } from "@shared/ui/components/landing-page/icons";
import { useSidebar } from "@shared/ui/components/ui/sidebar";
import { type JSX } from "react";

export function CustomSidebarHeader(): JSX.Element {
  const { open } = useSidebar();

  return (
    <div className="flex items-center justify-center w-full">
      <Link className="flex items-center gap-2" href="/dashboard">
        <Icons.Logo className="size-8" />
        {open ? <span className="text-lg font-medium">UI-Butler</span> : null}
      </Link>
    </div>
  );
}
