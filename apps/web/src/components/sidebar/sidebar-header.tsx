import Link from "next/link";
import { JSX } from "react";
import { Icons } from "@shared/ui/components/landing-page/icons";
import { useSidebar } from "@shared/ui/components/ui/sidebar";

/**
 * CustomSidebarHeader component renders the header of the sidebar
 * @returns {JSX.Element} Rendered sidebar header
 */
export function CustomSidebarHeader(): JSX.Element {
  const { open } = useSidebar();

  return (
    <div className="flex items-center justify-center w-full p-4">
      <Link
        className="flex items-center gap-2 transition-opacity hover:opacity-80"
        href="/dashboard"
      >
        <Icons.Logo className="size-8" />
        {open && <span className="text-lg font-medium">UI-Butler</span>}
      </Link>
    </div>
  );
}
