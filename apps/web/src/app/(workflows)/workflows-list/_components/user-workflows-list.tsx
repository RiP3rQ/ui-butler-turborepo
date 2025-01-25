"use client";

import { getUserWorkflows } from "@/actions/workflows/server-actions";
import { CreateWorkflowDialog } from "@/app/(workflows)/workflows-list/_components/create-workflow-dialog";
import { WorkflowCard } from "@/app/(workflows)/workflows-list/_components/workflow-card";
import { type Workflow } from "@shared/types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@shared/ui/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { AlertCircleIcon, InboxIcon } from "lucide-react";
import { type JSX } from "react";

interface UserWorkflowsProps {
  workflows: Workflow[];
}

export function UserWorkflows({
  workflows,
}: Readonly<UserWorkflowsProps>): JSX.Element {
  const { data, isError } = useQuery({
    queryKey: ["workflows"],
    queryFn: getUserWorkflows,
    initialData: workflows,
  });

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon className="size-4" />
        <AlertTitle>Failed to fetch workflows</AlertTitle>
        <AlertDescription>
          Something went wrong while fetching your workflows. Please try again
          later.
        </AlertDescription>
      </Alert>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col gap-4 h-full items-center justify-center">
        <div className="rounded-full bg-accent size-20 flex items-center justify-center">
          <InboxIcon className="stroke-primary" size={40} />
        </div>
        <div className="flex flex-col gap-1 text-center">
          <p className="font-bold">No workflows found</p>
          <p className="text-sm text-muted-foreground">
            Click the button below to create a new workflow
          </p>
        </div>
        <CreateWorkflowDialog triggerText="Created your first workflow" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {data.map((workflow) => (
        <WorkflowCard key={workflow.id} workflow={workflow} />
      ))}
    </div>
  );
}
