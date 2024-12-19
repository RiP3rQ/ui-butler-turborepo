import { DrizzleDatabase } from '../../database/merged-schemas';
import { workflowExecutions } from '../../database/schemas/workflow-executions';
import { WorkflowExecutionStatus } from '@repo/types';
import { eq } from 'drizzle-orm';

export async function pauseWorkflowExecution(
  executionId: number,
  database: DrizzleDatabase,
): Promise<void> {
  await database
    .update(workflowExecutions)
    .set({
      status: WorkflowExecutionStatus.WAITING_FOR_APPROVAL,
    })
    .where(eq(workflowExecutions.id, executionId));
}
