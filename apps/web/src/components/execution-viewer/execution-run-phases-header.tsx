import React, { type JSX } from "react";
import { WorkflowIcon } from "lucide-react";

function ExecutionRunPhasesHeader(): JSX.Element {
  return (
    <div className="flex items-center justify-center py-2 px-4">
      <div className="text-muted-foreground flex items-center gap-2">
        <WorkflowIcon className="stroke-muted-foreground/80" size={20} />
        <span className="font-semibold">Phases</span>
      </div>
    </div>
  );
}
export default ExecutionRunPhasesHeader;
