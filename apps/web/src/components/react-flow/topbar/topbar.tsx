"use client";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { TooltipWrapper } from "@repo/ui/components/tooltip-wrapper";
import { Button } from "@repo/ui/components/ui/button";
import { type JSX } from "react";
import NavigationTabs from "@/components/react-flow/topbar/navigation-tabs";
import ExecuteButton from "@/components/react-flow/topbar/execute-button";
import UnpublishButton from "@/components/react-flow/topbar/unpublish-button";
import SaveButton from "@/components/react-flow/topbar/save-button";
import PublishButton from "@/components/react-flow/topbar/publish-button";

interface TopbarProps {
  title: string;
  workflowId: number;
  subtitle?: string;
  hideButtons?: boolean;
  isPublished?: boolean;
}
function Topbar({
  title,
  workflowId,
  subtitle,
  hideButtons = false,
  isPublished = false,
}: Readonly<TopbarProps>): JSX.Element {
  const router = useRouter();

  return (
    <header className="flex p-2 border-b-2 border-separate justify-between w-full h-[60px] sticky top-0 bg-background z-10">
      <div className="flex gap-1 w-full justify-between">
        <div className="flex">
          <TooltipWrapper content="Back">
            <Button
              onClick={() => {
                router.back();
              }}
              size="icon"
              variant="ghost"
            >
              <ChevronLeftIcon className="size-5" />
            </Button>
          </TooltipWrapper>
          <div>
            <p className="font-bold text-ellipsis truncate">{title}</p>
            {subtitle ? (
              <p className="text-muted-foreground text-xs truncate text-ellipsis">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {/*NAV TABS*/}
        <NavigationTabs workflowId={workflowId} />
        {/* EXECUTE AND SAVE BUTTONS*/}
        <div className="flex gap-1 justify-end">
          {!hideButtons && (
            <>
              <ExecuteButton workflowId={workflowId} />
              {isPublished ? <UnpublishButton workflowId={workflowId} /> : null}
              {!isPublished && (
                <>
                  <SaveButton workflowId={workflowId} />
                  <PublishButton workflowId={workflowId} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
export default Topbar;
