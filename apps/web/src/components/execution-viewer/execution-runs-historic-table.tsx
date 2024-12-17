"use client";

import { InboxIcon } from "lucide-react";
import { type WorkflowExecution } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import ExecutionsTable from "@/components/execution-viewer/executions-table";
import { getHistoricWorkflowExecutions } from "@/actions/workflows/get-historic-workflow-executions";

interface ExecutionRunsHistoricTableProps {
  workflowId: string;
  historicExecutions: WorkflowExecution[];
}

function WorkflowHistoricExecutionsTable({
  workflowId,
  historicExecutions,
}: Readonly<ExecutionRunsHistoricTableProps>): JSX.Element {
  const { data, isError } = useQuery({
    queryKey: ["workflows"],
    queryFn: async () =>
      await getHistoricWorkflowExecutions({ workflowId: Number(workflowId) }),
    initialData: historicExecutions,
  });

  if (isError) {
    return <div>Could not find any historic executions</div>;
  }

  if (data.length === 0) {
    return <RenderEmptyState />;
  }

  return (
    <div className="container py-6 w-full">
      <ExecutionsTable initialData={data} workflowId={Number(workflowId)} />
    </div>
  );
}
export default WorkflowHistoricExecutionsTable;

function RenderEmptyState() {
  return (
    <div className="container w-full py-6">
      <div className="flex w-full h-full flex-col gap-2 justify-center items-center">
        <div className="rounded-full bg-accent size-20 flex items-center justify-center">
          <InboxIcon className="size-10 stroke-primary" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="font-bold text-2xl">
            No runs have been executed for this workflow
          </p>
          <p className="text-muted-foreground text-sm">
            You can execute the workflow by clicking on the execute button in
            Editor
          </p>
        </div>
      </div>
    </div>
  );
}
