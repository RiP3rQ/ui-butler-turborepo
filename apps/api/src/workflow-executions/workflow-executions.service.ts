import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import type { DrizzleDatabase } from '../database/merged-schemas';
import { eq } from 'drizzle-orm';
import { workflowExecutions } from '../database/schemas/workflow-executions';
import { Edge } from '@nestjs/core/inspector/interfaces/edge.interface';
import { Environment, WorkflowExecutionStatus } from '@repo/types';
import { initializeWorkflowExecution } from './helpers/initialize-workflow-execution';
import { initializeWorkflowPhasesStatuses } from './helpers/initialize-workflow-phases-statuses';
import { executeWorkflowPhase } from './helpers/execute-workflow-phase';
import { initializeFinalizeExecution } from './helpers/initialize-finalize-execution';

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
    const environment: Environment = {
      phases: {},
      code: '',
      workflowExecutionId: workflowExecutionId,
    };

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
        // Check if execution is waiting for approval
        const currentExecution =
          await this.database.query.workflowExecutions.findFirst({
            where: eq(workflowExecutions.id, workflowExecutionId),
          });

        if (
          currentExecution?.status ===
          WorkflowExecutionStatus.WAITING_FOR_APPROVAL
        ) {
          // Don't mark as failed, just return
          console.log('Workflow paused, waiting for approval');
          return;
        }

        executionFailed = true;
        break;
      }

      creditsConsumed += phaseExecution.creditsConsumed;
    }

    // Only finalize if not waiting for approval
    const currentExecution =
      await this.database.query.workflowExecutions.findFirst({
        where: eq(workflowExecutions.id, workflowExecutionId),
      });

    if (
      currentExecution?.status !== WorkflowExecutionStatus.WAITING_FOR_APPROVAL
    ) {
      await initializeFinalizeExecution(
        this.database,
        workflowExecutionId,
        execution.workflowId,
        executionFailed,
        creditsConsumed,
      );
    }

    console.log(
      `Workflow execution ${
        currentExecution?.status ===
        WorkflowExecutionStatus.WAITING_FOR_APPROVAL
          ? 'paused'
          : 'completed'
      } for workflowId: ${execution.workflowId}`,
    );
  }
}
