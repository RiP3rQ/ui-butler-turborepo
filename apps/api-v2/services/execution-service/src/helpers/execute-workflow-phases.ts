import {
  type Environment,
  type ExecutionPhase,
  type ServerSaveEdge,
  type WorkflowExecution,
  WorkflowExecutionStatus,
} from '@shared/types';
import { type DrizzleDatabase, eq, workflowExecutions } from '@app/database';
import { executeWorkflowPhase } from './execute-workflow-phase';
import { initializeFinalizeExecution } from './initialize-finalize-execution';

export async function executeWorkflowPhases(
  database: DrizzleDatabase,
  environment: Environment,
  executionId: number,
  phases: ExecutionPhase[],
  edges: ServerSaveEdge[],
  execution: WorkflowExecution,
) {
  let executionFailed = false;
  let creditsConsumed = 0;

  for (const phase of phases) {
    const phaseExecution = await executeWorkflowPhase(
      database,
      phase,
      environment,
      edges,
      execution.userId,
    );

    // Check if execution is waiting for approval
    if (
      phaseExecution.success === WorkflowExecutionStatus.WAITING_FOR_APPROVAL
    ) {
      // Check if execution is waiting for approval
      const executionData = await database.query.workflowExecutions.findFirst({
        where: eq(workflowExecutions.id, executionId),
      });

      if (
        executionData?.status === WorkflowExecutionStatus.WAITING_FOR_APPROVAL
      ) {
        // Stop execution here and wait for user approval
        return;
      }
    }

    // Handling phase execution failure
    if (!phaseExecution.success) {
      executionFailed = true;
      break;
    }

    creditsConsumed += phaseExecution.creditsConsumed;
  }

  // Finalize execution only if not waiting for approval
  await initializeFinalizeExecution(
    database,
    executionId,
    execution.workflowId,
    executionFailed,
    creditsConsumed,
  );
}
