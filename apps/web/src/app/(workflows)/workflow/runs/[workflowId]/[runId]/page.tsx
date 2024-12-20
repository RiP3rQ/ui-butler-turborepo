import { redirect } from "next/navigation";
import { toast } from "sonner";
import { type JSX } from "react";
import Topbar from "@/components/react-flow/topbar/topbar";
import { getWorkflowExecutionWithPhasesDetailsFunction } from "@/actions/workflows/get-workflow-execution-details";
import { ExecutionViewer } from "@/components/execution-viewer/execution-viewer";

type Params = Promise<{ workflowId: string; runId: string }>;
export default async function WorkflowRunPage({
  params,
}: Readonly<{
  params: Params;
}>): Promise<JSX.Element> {
  try {
    const { workflowId, runId } = await params;
    const workflowExecution =
      await getWorkflowExecutionWithPhasesDetailsFunction({
        executionId: runId,
      });
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <Topbar
          hideButtons
          subtitle={`Run ID: ${runId}`}
          title="Workflow execution details"
          workflowId={Number(workflowId)}
        />
        <section className="flex h-full overflow-auto">
          <ExecutionViewer
            executionId={Number(runId)}
            initialData={workflowExecution}
          />
        </section>
      </div>
    );
  } catch (e) {
    console.error("Error loading workflow:", e);
    toast.error("Workflow execution not found");
    return redirect("/workflows-list");
  }
}
