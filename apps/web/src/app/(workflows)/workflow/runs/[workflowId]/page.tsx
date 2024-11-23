import { Suspense } from "react";
import { Loader2Icon } from "lucide-react";
import Topbar from "@/components/react-flow/topbar/topbar";
import WorkflowHistoricExecutionsTable from "@/components/execution-viewer/execution-runs-historic-table";

type Params = Promise<{ workflowId: string }>;

const ExecutionHistoricDataForWorkflowPage = async ({
  params,
}: Readonly<{
  params: Params;
}>) => {
  const { workflowId } = await params;

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
        <WorkflowHistoricExecutionsTable workflowId={workflowId} />
      </Suspense>
    </div>
  );
};
export default ExecutionHistoricDataForWorkflowPage;
