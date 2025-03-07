import { ExecutionStatusIndicator } from "@/components/execution-viewer/execution-status-indicator";
import { ExecutionStatusLabel } from "@/components/execution-viewer/execution-status-label";
import { protoTimestampToDate } from "@/lib/dates";
import type { IWorkflowExecutionStatus, Workflow } from "@shared/types";
import { WorkflowStatus } from "@shared/types";
import { format, formatDistanceToNow } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { ChevronRightIcon, ClockIcon } from "lucide-react";
import Link from "next/link";
import { type JSX } from "react";

interface LastRunDetailsProps {
  workflow: Workflow;
}
export function LastRunDetails({
  workflow,
}: Readonly<LastRunDetailsProps>): JSX.Element | null {
  const { lastRunId, lastRunAt, lastRunStatus, nextRunAt, status } = workflow;

  if (status === WorkflowStatus.DRAFT) {
    return null;
  }

  const formattedStartedAt =
    lastRunAt &&
    formatDistanceToNow(protoTimestampToDate(lastRunAt), { addSuffix: true });
  const nextSchedule =
    nextRunAt && format(protoTimestampToDate(nextRunAt), "yyyy-MM-dd HH:mm");
  const nextSchduleUTC =
    nextRunAt &&
    formatInTimeZone(protoTimestampToDate(nextRunAt), "UTC", "HH:mm");

  return (
    <div className="bg-primary/5 px-4 py-1 flex justify-between items-center text-muted-foreground">
      <div className="flex items-center text-sm gap-2">
        {lastRunId ? (
          <Link
            className="flex items-center text-sm gap-2 group"
            href={`/workflow/runs/${String(workflow.id)}/${lastRunId}`}
          >
            <span>Last run:</span>
            <ExecutionStatusIndicator
              status={lastRunStatus as IWorkflowExecutionStatus}
            />
            <ExecutionStatusLabel
              status={lastRunStatus as IWorkflowExecutionStatus}
            />
            <span>{formattedStartedAt}</span>
            <ChevronRightIcon className="size-4 -translate-x-[2px] group-hover:translate-x-0 transition" />
          </Link>
        ) : (
          <p>No runs yet</p>
        )}
      </div>
      {nextRunAt ? (
        <div className="flex items-center text-sm gap-2">
          <ClockIcon className="size-3" />
          <span>Next run at:</span>
          <span>{nextSchedule}</span>
          <span className="text-xs">({nextSchduleUTC} UTC)</span>
        </div>
      ) : null}
    </div>
  );
}
