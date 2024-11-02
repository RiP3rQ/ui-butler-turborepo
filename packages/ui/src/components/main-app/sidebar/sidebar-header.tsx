import Link from "next/link";
import * as React from "react";
import Icons from "@repo/ui/components/landing-page/icons.tsx";
import { useSidebar } from "@repo/ui/components/ui/sidebar.tsx";

export function CustomSidebarHeader() {
  const { open } = useSidebar();

  return (
    <div className="flex items-center justify-center w-full">
      <Link className="flex items-center gap-2" href="/">
        <Icons.logo className="size-8" />
        {open ? <span className="text-lg font-medium">UI-Butler</span> : null}
      </Link>
    </div>
  );
}
