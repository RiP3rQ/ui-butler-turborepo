import { Workflow } from "@prisma/client";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import ExecutionStatusIndicator from "@/components/execution-viewer/execution-status-indicator";
import { WorkflowExecutionStatus, WorkflowStatus } from "@/types/workflow";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { formatInTimeZone } from "date-fns-tz";
import { ClockIcon } from "lucide-react";
import ExecutionStatusLabel from "@/components/execution-viewer/execution-status-label";

type LastRunDetailsProps = {
  workflow: Workflow;
};
const LastRunDetails = ({ workflow }: Readonly<LastRunDetailsProps>) => {
  const { lastRunId, lastRunAt, lastRunStatus, nextRunAt, status } = workflow;

  if (status === WorkflowStatus.DRAFT) {
    return null;
  }

  const formattedStartedAt =
    lastRunAt && formatDistanceToNow(lastRunAt, { addSuffix: true });
  const nextSchedule = nextRunAt && format(nextRunAt, "yyyy-MM-dd HH:mm");
  const nextSchduleUTC =
    nextRunAt && formatInTimeZone(nextRunAt, "UTC", "HH:mm");

  return (
    <div
      className={
        "bg-primary/5 px-4 py-1 flex justify-between items-center text-muted-foreground"
      }
    >
      <div className={"flex items-center text-sm gap-2"}>
        {lastRunId ? (
          <Link
            href={`/workflow/runs/${workflow.id}/${lastRunId}`}
            className={"flex items-center text-sm gap-2 group"}
          >
            <span>Last run:</span>
            <ExecutionStatusIndicator
              status={lastRunStatus as WorkflowExecutionStatus}
            />
            <ExecutionStatusLabel
              status={lastRunStatus as WorkflowExecutionStatus}
            />
            <span>{formattedStartedAt}</span>
            <ChevronRightIcon
              className={
                "size-4 -translate-x-[2px] group-hover:translate-x-0 transition"
              }
            />
          </Link>
        ) : (
          <p>No runs yet</p>
        )}
      </div>
      {nextRunAt && (
        <div className={"flex items-center text-sm gap-2"}>
          <ClockIcon className={"size-3"} />
          <span>Next run at:</span>
          <span>{nextSchedule}</span>
          <span className={"text-xs"}>({nextSchduleUTC} UTC)</span>
        </div>
      )}
    </div>
  );
};
export default LastRunDetails;
