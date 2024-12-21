import {
  type IWorkflowExecutionStatus,
  WorkflowExecutionStatus,
} from "@repo/types";
import { cn } from "@repo/ui/lib/utils";
import { type JSX } from "react";

const indicatorStatusColors = {
  [WorkflowExecutionStatus.COMPLETED]: "bg-green-500",
  [WorkflowExecutionStatus.FAILED]: "bg-red-500",
  [WorkflowExecutionStatus.RUNNING]: "bg-yellow-500",
  [WorkflowExecutionStatus.PENDING]: "bg-blue-500",
} as const;

interface ExecutionStatusIndicatorProps {
  status: IWorkflowExecutionStatus;
}
export function ExecutionStatusIndicator({
  status,
}: Readonly<ExecutionStatusIndicatorProps>): JSX.Element {
  // @ts-expect-error status is a valid key
  const statusColor = indicatorStatusColors[status] as string;
  return <div className={cn("size-2 rounded-full", statusColor)} />;
}
