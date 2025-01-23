import type { IWorkflowExecutionStatus } from "@shared/types";
import { WorkflowExecutionStatus } from "@shared/types";
import { cn } from "@shared/ui/lib/utils";
import { type JSX } from "react";

const statusLabelColors: Record<IWorkflowExecutionStatus, string> = {
  [WorkflowExecutionStatus.COMPLETED]: "text-green-500",
  [WorkflowExecutionStatus.FAILED]: "text-red-500",
  [WorkflowExecutionStatus.RUNNING]: "text-yellow-500",
  [WorkflowExecutionStatus.PENDING]: "text-blue-500",
  [WorkflowExecutionStatus.WAITING_FOR_APPROVAL]: "text-purple-500",
};

interface ExecutionStatusLabelProps {
  status: IWorkflowExecutionStatus;
}
export function ExecutionStatusLabel({
  status,
}: Readonly<ExecutionStatusLabelProps>): JSX.Element {
  return (
    <span className={cn("lowercase", statusLabelColors[status])}>{status}</span>
  );
}
