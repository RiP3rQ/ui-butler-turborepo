import { Inject, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Edge } from '@nestjs/core/inspector/interfaces/edge.interface';
import {
  ApproveChangesRequest,
  Environment,
  ExecutionPhaseStatus,
  IWorkflowExecutionStatus,
  WorkflowExecutionStatus,
} from '@repo/types';
import {
  and,
  DATABASE_CONNECTION,
  type DrizzleDatabase,
  eq,
  executionPhase,
  workflowExecutions,
} from '@app/database';
import { ApproveChangesDto, User } from '@app/common';
import { executeWorkflowPhases } from './helpers/execute-workflow-phases';
import { initializeWorkflowExecution } from './helpers/initialize-workflow-execution';
import { initializeWorkflowPhasesStatuses } from './helpers/initialize-workflow-phases-statuses';

@Injectable()
export class ExecutionsService {
  private readonly logger = new Logger(ExecutionsService.name);
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  async getPendingChanges(user: User, executionId: number) {
    try {
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
        throw new RpcException('Execution not found');
      }

      const pendingPhase = execution.executionPhases.find(
        (phase) => phase.status === ExecutionPhaseStatus.WAITING_FOR_APPROVAL,
      );

      this.logger.debug('Pending phase', pendingPhase);

      const parsedTemp = JSON.parse(pendingPhase?.temp || '{}');

      return {
        pendingApproval: parsedTemp,
        status: execution.status as IWorkflowExecutionStatus,
      } satisfies ApproveChangesRequest;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async approveChanges(
    user: User,
    executionId: number,
    body: ApproveChangesDto,
  ) {
    try {
      const execution = await this.database.query.workflowExecutions.findFirst({
        where: eq(workflowExecutions.id, executionId),
        with: {
          workflow: true,
          executionPhases: true,
        },
      });

      if (!execution) {
        throw new RpcException('Execution not found');
      }

      const currentPhase = execution.executionPhases.find(
        (phase) => phase.status === ExecutionPhaseStatus.WAITING_FOR_APPROVAL,
      );

      if (!currentPhase) {
        throw new RpcException('No pending phase found');
      }

      const remainingPhases = execution.executionPhases.filter(
        (phase) => phase.status === ExecutionPhaseStatus.PENDING,
      );

      const edges = (JSON.parse(execution.definition)?.edges ?? []) as Edge[];

      const temp = JSON.parse(currentPhase.temp || '{}');
      const originalCode = temp?.['Original code'] ?? '';
      const pendingCode = temp?.['Pending code'] ?? '';
      const componentId = Number(temp?.['Component ID'] ?? '');

      if (!componentId || isNaN(componentId)) {
        this.logger.warn('Component ID not found in temp');
      }

      const environment: Environment = {
        phases: {},
        code:
          body.decision === 'approve'
            ? (pendingCode ?? originalCode)
            : originalCode,
        startingCode: originalCode,
        workflowExecutionId: executionId,
        componentId,
      };

      this.logger.debug('Environment', environment);
      this.logger.debug('Current phase', currentPhase);
      this.logger.debug('remainingPhases', remainingPhases);

      await this.database
        .update(workflowExecutions)
        .set({
          status: WorkflowExecutionStatus.RUNNING,
        })
        .where(eq(workflowExecutions.id, executionId));

      await this.database
        .update(executionPhase)
        .set({
          status: ExecutionPhaseStatus.COMPLETED,
        })
        .where(eq(executionPhase.id, currentPhase.id));

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
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async executeWorkflow(
    workflowExecutionId: number,
    componentId: number,
    nextRunAt?: Date,
  ) {
    try {
      this.logger.debug('executing workflow', workflowExecutionId);

      const execution = await this.database.query.workflowExecutions.findFirst({
        where: eq(workflowExecutions.id, workflowExecutionId),
        with: {
          workflow: true,
          executionPhases: true,
        },
      });

      this.logger.debug('execution', execution);

      if (!execution) {
        throw new RpcException('Execution not found');
      }

      const edges = (JSON.parse(execution.definition)?.edges ?? []) as Edge[];
      const environment: Environment = {
        phases: {},
        code: '',
        startingCode: '',
        workflowExecutionId: workflowExecutionId,
        componentId: componentId,
      };

      await initializeWorkflowExecution(
        this.database,
        workflowExecutionId,
        execution.workflowId,
        nextRunAt,
      );

      await initializeWorkflowPhasesStatuses(
        this.database,
        execution.executionPhases,
      );

      await executeWorkflowPhases(
        this.database,
        environment,
        workflowExecutionId,
        execution.executionPhases,
        edges,
        execution,
      );

      this.logger.debug(
        `Workflow execution ${
          execution?.status === WorkflowExecutionStatus.WAITING_FOR_APPROVAL
            ? 'paused'
            : 'completed'
        } for workflowId: ${execution.workflowId}`,
      );

      return {};
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }
}
