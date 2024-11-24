import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import type { DrizzleDatabase } from '../database/merged-schemas';
import { eq } from 'drizzle-orm';
import { workflowExecutions } from '../database/schemas/workflow-executions';
import { Edge } from '@nestjs/core/inspector/interfaces/edge.interface';
import { Environment } from '@repo/types';
import { initializeWorkflowExecution } from './helpers/initializeWorkflowExecution';
import { initializeWorkflowPhasesStatuses } from './helpers/initializeWorkflowPhasesStatuses';
import { executeWorkflowPhase } from './helpers/executeWorkflowPhase';
import { initializeFinalizeExecution } from './helpers/initializeFinalizeExecution';

@Injectable()
export class WorkflowExecutionsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  async executeWorkflow(workflowExecutionId: number, nextRunAt?: Date) {
    // execute workflow
    console.log('executing workflow', workflowExecutionId);

    const execution = await this.database.query.workflowExecutions.findFirst({
      where: eq(workflowExecutions.id, workflowExecutionId),
      with: {
        workflow: true,
        executionPhases: true,
      },
    });

    if (!execution) {
      throw new Error('Execution not found');
    }

    const edges = (JSON.parse(execution.definition)?.edges ?? []) as Edge[];
    const environment: Environment = { phases: {}, code: '' };

    // INIT WORKFLOW EXECUTION
    await initializeWorkflowExecution(
      this.database,
      workflowExecutionId,
      execution.workflowId,
      nextRunAt,
    );
    // INIT PHASES STATUSES
    await initializeWorkflowPhasesStatuses(
      this.database,
      execution.executionPhases,
    );

    // VALUES NEEDED TO FINALIZE EXECUTION OF WORKFLOW
    let executionFailed: boolean = false;
    let creditsConsumed: number = 0;

    // MAP THROUGH PHASES AND EXECUTE THEM
    for (const phase of execution.executionPhases) {
      // EXECUTE PHASE with failure handling
      const phaseExecution = await executeWorkflowPhase(
        this.database,
        phase,
        environment,
        edges,
        execution.userId,
      );
      if (!phaseExecution.success) {
        executionFailed = true;
        break;
      }
      // Summing of credits consumed
      creditsConsumed += phaseExecution.creditsConsumed;
    }

    // Finalize execution
    await initializeFinalizeExecution(
      this.database,
      workflowExecutionId,
      execution.workflowId,
      executionFailed,
      creditsConsumed,
    );

    console.log(
      `Workflow execution completed for workflowId: ${execution.workflowId}`,
    );

    console.log('Revalidating paths');
    // revalidatePath('/workflows');
    // revalidatePath('/workflows/runs');
  }
}
