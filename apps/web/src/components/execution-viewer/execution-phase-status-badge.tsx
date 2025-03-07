import type { IExecutionPhaseStatus } from "@shared/types";
import { ExecutionPhaseStatus } from "@shared/types";
import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleXIcon,
  Loader2Icon,
} from "lucide-react";
import { type JSX } from "react";

interface ExecutionPhaseStatusBadgeProps {
  status: IExecutionPhaseStatus;
}

function ExecutionPhaseStatusBadge({
  status,
}: Readonly<ExecutionPhaseStatusBadgeProps>): JSX.Element {
  switch (status) {
    case ExecutionPhaseStatus.PENDING:
      return <CircleDashedIcon className="stroke-muted-foreground" size={20} />;
    case ExecutionPhaseStatus.RUNNING:
      return (
        <Loader2Icon className="animate-spin stroke-amber-500" size={20} />
      );
    case ExecutionPhaseStatus.COMPLETED:
      return <CircleCheckIcon className="stroke-green-400" size={20} />;
    case ExecutionPhaseStatus.FAILED:
      return <CircleXIcon className="stroke-destructive" size={20} />;
    default:
      return <div className="rounded-full">{status}</div>;
  }
}

export default ExecutionPhaseStatusBadge;
