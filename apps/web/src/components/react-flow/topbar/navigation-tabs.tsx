"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";

interface NavigationTabsProps {
  workflowId: number;
}
function NavigationTabs({ workflowId }: Readonly<NavigationTabsProps>) {
  const pathname = usePathname();
  const activeValue = pathname.split("/")[2];

  return (
    <Tabs className="w-[400px]" value={activeValue}>
      <TabsList className="grid grid-cols-2 w-full text-center">
        <Link href={`/workflow/editor/${workflowId.toString()}`}>
          <TabsTrigger className="h-full w-full" value="editor">
            Editor
          </TabsTrigger>
        </Link>
        <Link href={`/workflow/runs/${workflowId.toString()}`}>
          <TabsTrigger className="h-full w-full" value="runs">
            Runs history
          </TabsTrigger>
        </Link>
      </TabsList>
    </Tabs>
  );
}
export default NavigationTabs;
