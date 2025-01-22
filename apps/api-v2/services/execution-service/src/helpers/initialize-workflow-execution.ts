import { WorkflowExecutionStatus } from '@repo/types';
import { NotFoundException } from '@nestjs/common';
import {
  type DrizzleDatabase,
  eq,
  type WorkflowUpdate,
  workflowExecutions,
  workflows,
} from '@app/database';

export async function initializeWorkflowExecution(
  database: DrizzleDatabase,
  executionId: number,
  workflowId: number,
  nextRunAt?: Date,
) {
  const updatedExecutionData = {
    status: WorkflowExecutionStatus.RUNNING,
    startedAt: new Date(),
  };

  const updatedWorkflowData: WorkflowUpdate = {
    lastRunAt: new Date(),
    lastRunStatus: WorkflowExecutionStatus.RUNNING,
    lastRunId: executionId.toString(),
    ...(nextRunAt && { nextRunAt }),
  };

  const [updatedExecution, updatedWorkflow] = await Promise.all([
    // Update workflow execution
    database
      .update(workflowExecutions)
      .set(updatedExecutionData)
      .where(eq(workflowExecutions.id, executionId))
      .returning(),

    // Update workflow
    database
      .update(workflows)
      .set(updatedWorkflowData)
      .where(eq(workflows.id, workflowId))
      .returning(),
  ]);

  if (!updatedExecution.length || !updatedWorkflow.length) {
    throw new NotFoundException('Workflow or execution not found');
  }
}
