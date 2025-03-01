"use client";

import { DuplicateWorkflowDialog } from "@/app/(workflows)/workflows-list/_components/duplicate-workflow-dialog";
import { EditWorkflowButton } from "@/app/(workflows)/workflows-list/_components/edit-workflow-button";
import { LastRunDetails } from "@/app/(workflows)/workflows-list/_components/last-run-details";
import { RunWorkflowButton } from "@/app/(workflows)/workflows-list/_components/run-workflow-button";
import { WorkflowActionButtons } from "@/app/(workflows)/workflows-list/_components/workflow-action-buttons";
import { type Workflow, WorkflowStatus } from "@shared/types";
import { TooltipWrapper } from "@shared/ui/components/tooltip-wrapper";
import { Card, CardContent } from "@shared/ui/components/ui/card";
import { cn } from "@shared/ui/lib/utils";
import { FileIcon, PlayIcon } from "lucide-react";
import Link from "next/link";
import { type JSX } from "react";

const STATUS_COLORS = {
  [WorkflowStatus.DRAFT]: "bg-yellow-400 text-yellow-600",
  [WorkflowStatus.PUBLISHED]: "bg-primary",
};

interface WorkflowCardProps {
  workflow: Workflow;
}
export function WorkflowCard({
  workflow,
}: Readonly<WorkflowCardProps>): JSX.Element {
  const isDraft = workflow.status === "DRAFT";

  return (
    <Card className="border border-separate shadow-sm rounded-lg overflow-hidden hover:shadow-md dark:shadow-primary/30 group/card">
      <CardContent className="p-4 flex items-center justify-between h-[100px]">
        <div className="flex items-center justify-start space-x-3">
          <div
            className={cn(
              "size-10 rounded-full flex items-center justify-center",
              STATUS_COLORS[workflow.status],
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
                  href={`/workflow/editor/${String(workflow.id)}`}
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
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/*  EDIT BUTTON */}
          <RunWorkflowButton workflowId={workflow.id} />
          <EditWorkflowButton workflowId={workflow.id} />
          <WorkflowActionButtons
            workflowId={workflow.id}
            workflowName={workflow.name}
          />
        </div>
      </CardContent>
      <LastRunDetails workflow={workflow} />
    </Card>
  );
}
