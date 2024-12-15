import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import type { DrizzleDatabase } from '../database/merged-schemas';
import { and, eq } from 'drizzle-orm';
import { workflowExecutions } from '../database/schemas/workflow-executions';
import { Edge } from '@nestjs/core/inspector/interfaces/edge.interface';
import {
  Environment,
  ExecutionPhaseStatus,
  WorkflowExecutionStatus,
} from '@repo/types';
import { initializeWorkflowExecution } from './helpers/initialize-workflow-execution';
import { initializeWorkflowPhasesStatuses } from './helpers/initialize-workflow-phases-statuses';
import { User } from '../database/schemas/users';
import { ApproveChangesDto } from './dto/approve-changes.dto';
import { executeWorkflowPhases } from './helpers/execute-workflow-phases';

@Injectable()
export class WorkflowExecutionsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  // GET /workflow-executions/:executionId/pending-changes
  async getPendingChanges(user: User, executionId: number) {
    const execution = await this.database.query.workflowExecutions.findFirst({
      where: and(
        eq(workflowExecutions.id, executionId),
        eq(workflowExecutions.userId, user.id),
      ),
      with: {
        executionPhases: true,
      },
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    const pendingPhase = execution.executionPhases.find(
      (phase) => phase.status === ExecutionPhaseStatus.PENDING,
    );

    return {
      pendingCode: pendingPhase?.outputs ?? {},
      status: execution.status,
    };
  }

  // POST /workflow-executions/:executionId/approve
  async approveChanges(
    user: User,
    executionId: number,
    body: ApproveChangesDto,
  ) {
    // Get the current execution with all necessary data
    const execution = await this.database.query.workflowExecutions.findFirst({
      where: eq(workflowExecutions.id, executionId),
      with: {
        workflow: true,
        executionPhases: true,
      },
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    // Find the current pending phase that requested approval
    const currentPhase = execution.executionPhases.find(
      (phase) => phase.status === ExecutionPhaseStatus.PENDING,
    );

    if (!currentPhase) {
      throw new Error('No pending phase found');
    }

    // Parse the current phase inputs to get the original code
    const inputs = JSON.parse(currentPhase.inputs || '{}');
    const originalCode = inputs.originalCode || ''; // This should be stored in inputs when requesting approval

    // Get the remaining phases
    const currentPhaseIndex = execution.executionPhases.indexOf(currentPhase);
    const remainingPhases = execution.executionPhases.slice(currentPhaseIndex);

    // Parse edges from the execution definition
    const edges = (JSON.parse(execution.definition)?.edges ?? []) as Edge[];

    // Create environment with the appropriate code context

    const environment: Environment = {
      phases: {},
      // If not approved, use original code, if approved use the modified code
      // @ts-expect-error - TS doesn't know currentPhase.outputs?.code is defined
      code: body.approve ? currentPhase.outputs?.code || '' : originalCode,
      workflowExecutionId: executionId,
    };

    // Update execution status to RUNNING
    await this.database
      .update(workflowExecutions)
      .set({
        status: WorkflowExecutionStatus.RUNNING,
      })
      .where(eq(workflowExecutions.id, executionId));

    // Continue execution with remaining phases
    await executeWorkflowPhases(
      this.database,
      environment,
      executionId,
      remainingPhases,
      edges,
      execution,
    );

    return {
      message: body.approve
        ? 'Changes approved, workflow execution resumed'
        : 'Changes rejected, continuing with original code',
      status: WorkflowExecutionStatus.RUNNING,
    };
  }

  // EXECUTE WORKFLOW ----------------------------------------------------------
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

    // EXECUTE PHASES
    await executeWorkflowPhases(
      this.database,
      environment,
      workflowExecutionId,
      execution.executionPhases,
      edges,
      execution,
    );

    console.log(
      `Workflow execution ${
        execution?.status === WorkflowExecutionStatus.WAITING_FOR_APPROVAL
          ? 'paused'
          : 'completed'
      } for workflowId: ${execution.workflowId}`,
    );
  }
}
