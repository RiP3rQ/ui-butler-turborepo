import ExecutionViewer from "@/components/execution-viewer/execution-viewer";
import { getWorkflowExecutionWithPhasesDetailsFunction } from "@/actions/workflows/get-workflow-execution-details";

interface ExecutionViewerWrapperProps {
  executionId: number;
}

async function ExecutionViewerWrapper({
  executionId,
}: Readonly<ExecutionViewerWrapperProps>) {
  const workflowExecution = await getWorkflowExecutionWithPhasesDetailsFunction(
    { executionId },
  );

  if (!workflowExecution) {
    return <div>Workflow execution not found</div>;
  }

  return <ExecutionViewer initialData={workflowExecution} />;
}
export default ExecutionViewerWrapper;
