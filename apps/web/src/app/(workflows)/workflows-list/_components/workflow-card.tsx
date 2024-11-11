"use client";

import type { WorkflowType } from "@repo/types/workflow";
import { WorkflowStatus } from "@repo/types/workflow";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { FileIcon, MoreVerticalIcon, PlayIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { useState } from "react";
import { TooltipWrapper } from "@repo/ui/components/main-app/tooltip-wrapper";

const STATUS_COLORS = {
  [WorkflowStatus.DRAFT]: "bg-yellow-400 text-yellow-600",
  [WorkflowStatus.PUBLISHED]: "bg-primary",
};

interface WorkflowCardProps {
  workflow: WorkflowType;
}
function WorkflowCard({ workflow }: Readonly<WorkflowCardProps>): JSX.Element {
  const isDraft = workflow.status === "DRAFT";

  return (
    <Card className="border border-separate shadow-sm rounded-lg overflow-hidden hover:shadow-md dark:shadow-primary/30 group/card">
      <CardContent className="p-4 flex items-center justify-between h-[100px]">
        <div className="flex items-center justify-start space-x-3">
          <div
            className={cn(
              "size-10 rounded-full flex items-center justify-center",
              STATUS_COLORS[workflow.status as WorkflowStatus],
            )}
          >
            {isDraft ? (
              <FileIcon className="size-5" />
            ) : (
              <PlayIcon className="size-5" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-muted-foreground flex items-center">
              <TooltipWrapper content={workflow.description}>
                <Link
                  className="flex items-center hover:underline"
                  href={`/workflow/editor/${workflow.id}`}
                >
                  {workflow.name}
                </Link>
              </TooltipWrapper>
              {isDraft ? (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Draft
                </span>
              ) : null}
              <DuplicateWorkflowDialog workflowId={workflow.id} />
            </h3>
            <ScheduleSection
              creditsCost={workflow.creditsCost}
              isDraft={isDraft}
              workflowCron={workflow.cron}
              workflowId={workflow.id}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/*  EDIT BUTTON */}
          <RunWorkflowButton workflowId={workflow.id} />
          <EditWorkflowButton workflowId={workflow.id} />
          <WorkflowActions
            workflowId={workflow.id}
            workflowName={workflow.name}
          />
        </div>
      </CardContent>
      <LastRunDetails workflow={workflow} />
    </Card>
  );
}
export default WorkflowCard;

function WorkflowActions({
  workflowName,
  workflowId,
}: Readonly<{ workflowName: string; workflowId: string }>) {
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  return (
    <>
      <DeleteWorkflowDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        workflowId={workflowId}
        workflowName={workflowName}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            <TooltipWrapper content="More actions">
              <div className="w-full h-full flex items-center justify-start">
                <MoreVerticalIcon size={18} />
              </div>
            </TooltipWrapper>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-center">Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-500 flex items-center justify-center gap-2"
            onClick={() => {
              setShowDeleteDialog(true);
            }}
          >
            <TrashIcon className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
