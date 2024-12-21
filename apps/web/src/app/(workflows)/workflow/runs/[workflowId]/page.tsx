import { type JSX, Suspense } from "react";
import { Loader2Icon } from "lucide-react";
import Topbar from "@/components/react-flow/topbar/topbar";
import WorkflowHistoricExecutionsTable from "@/components/execution-viewer/execution-runs-historic-table";
import { getHistoricWorkflowExecutions } from "@/actions/workflows/server-actions";

type Params = Promise<{ workflowId: string }>;

export default async function ExecutionHistoricDataForWorkflowPage({
  params,
}: Readonly<{
  params: Params;
}>): Promise<JSX.Element> {
  const workflowId = (await params).workflowId;

  const historicExecutions = await getHistoricWorkflowExecutions({
    workflowId: Number(workflowId),
  });

  return (
    <div className="h-full w-full overflow-auto">
      <Topbar
        hideButtons
        subtitle="List of all runs for this workflow"
        title="All runs"
        workflowId={Number(workflowId)}
      />
      <Suspense
        fallback={
          <div className="w-full h-[calc(100%-60px)] flex items-center justify-center flex-col">
            <Loader2Icon className="animate-spin stroke-primary" size={40} />
            <p className="font-bold text-2xl">
              Loading historic workflow executions...
            </p>
          </div>
        }
      >
        <WorkflowHistoricExecutionsTable
          workflowId={workflowId}
          historicExecutions={historicExecutions}
        />
      </Suspense>
    </div>
  );
}
