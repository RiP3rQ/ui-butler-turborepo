import { Suspense } from "react";
import { Loader2Icon } from "lucide-react";
import Topbar from "@/components/react-flow/topbar/topbar";
import ExecutionViewerWrapper from "@/components/execution-viewer/execution-viewer-wrapper";

type Params = Promise<{ workflowId: string; runId: string }>;
const WorkflowRunPage = async ({
  params,
}: Readonly<{
  params: Params;
}>) => {
  const { workflowId, runId } = await params;
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar
        hideButtons
        subtitle={`Run ID: ${runId}`}
        title="Workflow execution details"
        workflowId={Number(workflowId)}
      />
      <section className="flex h-full overflow-auto">
        <Suspense fallback={<ExecutionViewerLoader />}>
          <ExecutionViewerWrapper executionId={Number(runId)} />
        </Suspense>
      </section>
    </div>
  );
};
export default WorkflowRunPage;

function ExecutionViewerLoader() {
  return (
    <div className="flex w-full items-center justify-center">
      <Loader2Icon className="size-10 animate-spin stroke-green-400" />
    </div>
  );
}
