import { WorkflowExecutionStatus } from '@repo/types/workflow.ts';
import { cn } from '@repo/ui/lib/utils';

const statusLabelColors: Record<WorkflowExecutionStatus, string> = {
  [WorkflowExecutionStatus.COMPLETED]: "text-green-500",
  [WorkflowExecutionStatus.FAILED]: "text-red-500",
  [WorkflowExecutionStatus.RUNNING]: "text-yellow-500",
  [WorkflowExecutionStatus.PENDING]: "text-blue-500",
};

interface ExecutionStatusLabelProps {
  status: WorkflowExecutionStatus;
}
export function ExecutionStatusLabel({
  status,
}: Readonly<ExecutionStatusLabelProps>): JSX.Element {
  return (
    <span className={cn("lowercase", statusLabelColors[status])}>{status}</span>
  );
}
