import { redirect } from 'next/navigation';
import ExecutionViewer from '@/components/execution-viewer/execution-viewer';
import { getWorkflowExecutionWithPhasesDetailsFunction } from '@/actions/workflows/get-workflow-execution-details';

interface ExecutionViewerWrapperProps {
  executionId: number;
}

const ExecutionViewerWrapper = async ({
                                        executionId,
                                      }: Readonly<ExecutionViewerWrapperProps>) => {
  // const { userId } = await auth();
  const userId = 123; // TODO: Replace with actual user ID from auth

  if (!userId) {
    return redirect('/sign-up');
  }

  const workflowExecution = await getWorkflowExecutionWithPhasesDetailsFunction(
    { executionId },
  );

  if (!workflowExecution) {
    return <div>Workflow execution not found</div>;
  }

  return <ExecutionViewer initialData={workflowExecution} />;
};
export default ExecutionViewerWrapper;
