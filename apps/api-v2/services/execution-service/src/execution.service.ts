import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { Edge } from '@nestjs/core/inspector/interfaces/edge.interface';
import {
  ApproveChangesRequest,
  Environment,
  ExecutionPhaseStatus,
  IWorkflowExecutionStatus,
  WorkflowExecutionStatus,
} from '@repo/types';
import {
  DATABASE_CONNECTION,
  type DrizzleDatabase,
  executionPhase,
  workflowExecutions,
} from '@app/database';
import { ApproveChangesDto, User } from '@app/common';
import { executeWorkflowPhases } from './helpers/execute-workflow-phases';
import { initializeWorkflowExecution } from './helpers/initialize-workflow-execution';
import { initializeWorkflowPhasesStatuses } from './helpers/initialize-workflow-phases-statuses';

@Injectable()
export class ExecutionsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

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
      (phase) => phase.status === ExecutionPhaseStatus.WAITING_FOR_APPROVAL,
    );

    console.log('Pending phase', pendingPhase);

    const parsedTemp = JSON.parse(pendingPhase?.temp || '{}');

    return {
      pendingApproval: parsedTemp,
      status: execution.status as IWorkflowExecutionStatus,
    } satisfies ApproveChangesRequest;
  }

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
      (phase) => phase.status === ExecutionPhaseStatus.WAITING_FOR_APPROVAL,
    );

    if (!currentPhase) {
      throw new Error('No pending phase found');
    }

    // Get the remaining phases
    console.log('execution.executionPhases', execution.executionPhases);
    const remainingPhases = execution.executionPhases.filter(
      (phase) => phase.status === ExecutionPhaseStatus.PENDING,
    );

    // Parse edges from the execution definition
    const edges = (JSON.parse(execution.definition)?.edges ?? []) as Edge[];

    // Parse the current phase outputs to get the pending code
    const temp = JSON.parse(currentPhase.temp || '{}');
    const originalCode = temp?.['Original code'] ?? '';
    const pendingCode = temp?.['Pending code'] ?? '';
    const componentId = Number(temp?.['Component ID'] ?? '');

    if (!componentId || isNaN(componentId)) {
      console.warn('Component ID not found in temp');
    }

    // Create environment with the appropriate code context
    const environment: Environment = {
      phases: {},
      // If not approved, use original code, if approved use the modified code
      code:
        body.decision === 'approve'
          ? (pendingCode ?? originalCode)
          : originalCode,
      startingCode: originalCode,
      workflowExecutionId: executionId,
      componentId,
    };

    console.log('Environment', environment);
    console.log('Current phase', currentPhase);
    console.log('remainingPhases', remainingPhases);

    // Update execution status to RUNNING
    await this.database
      .update(workflowExecutions)
      .set({
        status: WorkflowExecutionStatus.RUNNING,
      })
      .where(eq(workflowExecutions.id, executionId));

    // Update current phase status to COMPLETED
    await this.database
      .update(executionPhase)
      .set({
        status: ExecutionPhaseStatus.COMPLETED,
      })
      .where(eq(executionPhase.id, currentPhase.id));

    // Continue execution with remaining phases
    executeWorkflowPhases(
      this.database,
      environment,
      executionId,
      remainingPhases,
      edges,
      execution,
    );

    return {
      message:
        body.decision === 'approve'
          ? 'Changes approved, workflow execution resumed'
          : 'Changes rejected, continuing with original code',
      status: WorkflowExecutionStatus.RUNNING,
    };
  }

  async executeWorkflow(
    workflowExecutionId: number,
    componentId: number,
    nextRunAt?: Date,
  ) {
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
      startingCode: '',
      workflowExecutionId: workflowExecutionId,
      componentId: componentId,
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
