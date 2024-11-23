import type { IWorkflowExecutionStatus } from "@repo/types";
import { WorkflowExecutionStatus } from "@repo/types";
import { cn } from "@repo/ui/lib/utils";

const statusLabelColors: Record<IWorkflowExecutionStatus, string> = {
  [WorkflowExecutionStatus.COMPLETED]: "text-green-500",
  [WorkflowExecutionStatus.FAILED]: "text-red-500",
  [WorkflowExecutionStatus.RUNNING]: "text-yellow-500",
  [WorkflowExecutionStatus.PENDING]: "text-blue-500",
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
