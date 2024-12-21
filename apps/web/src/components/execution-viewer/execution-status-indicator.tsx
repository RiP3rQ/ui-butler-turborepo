import { WorkflowExecutionStatus } from "@repo/types";
import { cn } from "@repo/ui/lib/utils";
import { type JSX } from "react";

const indicatorStatusColors: Record<WorkflowExecutionStatus, string> = {
  [WorkflowExecutionStatus.COMPLETED]: "bg-green-500",
  [WorkflowExecutionStatus.FAILED]: "bg-red-500",
  [WorkflowExecutionStatus.RUNNING]: "bg-yellow-500",
  [WorkflowExecutionStatus.PENDING]: "bg-blue-500",
};

interface ExecutionStatusIndicatorProps {
  status: WorkflowExecutionStatus;
}
export function ExecutionStatusIndicator({
  status,
}: Readonly<ExecutionStatusIndicatorProps>): JSX.Element {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    <div className={cn("size-2 rounded-full", indicatorStatusColors[status])} />
  );
}
