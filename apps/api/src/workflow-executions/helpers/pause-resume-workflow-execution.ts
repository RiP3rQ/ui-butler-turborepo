import { DrizzleDatabase } from '../../database/merged-schemas';
import { workflowExecutions } from '../../database/schemas/workflow-executions';
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from '@repo/types';
import { eq } from 'drizzle-orm';
import { NotFoundException } from '@nestjs/common';

export async function pauseResumeWorkflowExecution(
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

export async function resumeWorkflowExecution(
  executionId: number,
  database: DrizzleDatabase,
  approved: boolean,
) {
  if (approved) {
    return database.transaction(async (tx) => {
      const execution = await tx.query.workflowExecutions.findFirst({
        where: eq(workflowExecutions.id, executionId),
        with: {
          workflow: true,
          executionPhases: true,
        },
      });

      if (!execution) {
        throw new NotFoundException('Execution not found');
      }

      // Resume execution from the next phase
      const currentPhaseIndex = execution.executionPhases.findIndex(
        (phase) => phase.status === ExecutionPhaseStatus.PENDING,
      );

      if (currentPhaseIndex === -1) {
        throw new Error('No pending phases found');
      }

      // Continue execution from the next phase
      const remainingPhases =
        execution.executionPhases.slice(currentPhaseIndex);

      // Update execution status
      await tx
        .update(workflowExecutions)
        .set({
          status: WorkflowExecutionStatus.RUNNING,
        })
        .where(eq(workflowExecutions.id, executionId));

      return remainingPhases;
    });
  } else {
    // If not approved, mark the execution as failed
    const failedData = {
      status: WorkflowExecutionStatus.FAILED,
      completedAt: new Date(),
    };

    await database
      .update(workflowExecutions)
      .set(failedData)
      .where(eq(workflowExecutions.id, executionId));

    return null;
  }
}
