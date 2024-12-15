import { WorkflowExecutionStatus } from '@repo/types';
import { DrizzleDatabase } from '../../database/merged-schemas';
import { workflowExecutions } from '../../database/schemas/workflow-executions';
import { and, eq, ne } from 'drizzle-orm';
import { workflows, WorkflowUpdate } from '../../database/schemas/workflows';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export async function initializeFinalizeExecution(
  database: DrizzleDatabase,
  executionId: number,
  workflowId: number,
  executionFailed: boolean = false,
  creditsConsumed: number = 0,
) {
  if (!executionId || !workflowId) {
    throw new Error('Execution ID and Workflow ID are required');
  }

  // First, check if the execution is in WAITING_FOR_APPROVAL status
  const currentExecution = await database.query.workflowExecutions.findFirst({
    where: eq(workflowExecutions.id, executionId),
  });

  if (
    currentExecution?.status === WorkflowExecutionStatus.WAITING_FOR_APPROVAL
  ) {
    // If waiting for approval, don't update the status
    return;
  }

  const finalStatus = executionFailed
    ? WorkflowExecutionStatus.FAILED
    : WorkflowExecutionStatus.COMPLETED;

  const workflowExecutionData = {
    status: finalStatus,
    completedAt: new Date(),
    creditsConsumed,
  };

  const workflowData: WorkflowUpdate = {
    lastRunStatus: finalStatus,
  };

  // Update the execution status of the workflow
  return await database.transaction(async (tx) => {
    try {
      const [updatedExecution, updatedWorkflow] = await Promise.all([
        // Update workflow execution
        tx
          .update(workflowExecutions)
          .set(workflowExecutionData)
          .where(
            and(
              eq(workflowExecutions.id, executionId),
              // Only update if not in WAITING_FOR_APPROVAL status
              ne(
                workflowExecutions.status,
                WorkflowExecutionStatus.WAITING_FOR_APPROVAL,
              ),
            ),
          )
          .returning(),
        // Update workflow status
        tx
          .update(workflows)
          .set(workflowData)
          .where(
            and(
              eq(workflows.id, workflowId),
              eq(workflows.lastRunId, executionId.toString()),
            ),
          )
          .returning(),
      ]);

      if (!updatedExecution) {
        throw new NotFoundException(`Execution ${executionId} not found`);
      }

      if (!updatedWorkflow) {
        throw new NotFoundException(`Workflow ${workflowId} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update execution and workflow status',
      );
    }
  });
}
