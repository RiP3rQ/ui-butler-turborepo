import { WorkflowExecutionStatus } from '@repo/types';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  type DrizzleDatabase,
  eq,
  ne,
  workflowExecutions,
  workflows,
  type WorkflowUpdate,
} from '@app/database';

export async function initializeFinalizeExecution(
  database: DrizzleDatabase,
  executionId: number,
  workflowId: number,
  executionFailed: boolean,
  creditsConsumed: number,
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
  await database.transaction(async (tx) => {
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

      if (!updatedExecution.length) {
        throw new NotFoundException(
          `Execution ${String(executionId)} not found`,
        );
      }

      if (!updatedWorkflow.length) {
        throw new NotFoundException(`Workflow ${String(workflowId)} not found`);
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
