import { status } from '@grpc/grpc-js';
import type { ApproveChangesDto } from '@microservices/common';
import {
  and,
  DATABASE_CONNECTION,
  type DrizzleDatabase,
  eq,
  executionPhase,
  workflowExecutions,
} from '@microservices/database';
import { ExecutionProto } from '@microservices/proto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Edge } from '@nestjs/core/inspector/interfaces/edge.interface';
import { RpcException } from '@nestjs/microservices';
import {
  Environment,
  ExecutionPhaseStatus,
  IWorkflowExecutionStatus,
  WorkflowExecutionStatus,
} from '@shared/types';
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

  public async getPendingChanges(
    request: ExecutionProto.GetPendingChangesRequest,
  ): Promise<ExecutionProto.PendingChangesResponse> {
    try {
      if (!request.executionId || !request.user) {
        throw new RpcException('Execution id and user are required');
      }

      const execution = await this.database.query.workflowExecutions.findFirst({
        where: and(
          eq(workflowExecutions.id, Number(request.executionId)),
          eq(workflowExecutions.userId, Number(request.user.id)),
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

      const parsedTemp = JSON.parse(pendingPhase?.temp ?? '{}') as Record<
        string,
        string
      >;

      return {
        $type: 'api.execution.PendingChangesResponse',
        pendingApproval: parsedTemp,
        status: execution.status as IWorkflowExecutionStatus,
      } satisfies ExecutionProto.PendingChangesResponse;
    } catch (error: unknown) {
      console.error(
        `[ERROR] Error getting pending changes: ${JSON.stringify(error)}`,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async approveChanges(
    request: ExecutionProto.ApproveChangesRequest,
  ): Promise<ExecutionProto.ApproveChangesResponse> {
    try {
      if (!request.executionId) {
        throw new RpcException('Execution id is required');
      }

      if (!request.user) {
        throw new RpcException('User is required');
      }

      if (!request.body) {
        throw new RpcException('Body is required');
      }

      const approveChangesDto: ApproveChangesDto = {
        decision: request.body.decision,
      };

      const execution = await this.database.query.workflowExecutions.findFirst({
        where: eq(workflowExecutions.id, Number(request.executionId)),
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

      const definition = JSON.parse(execution.definition) as { edges?: Edge[] };
      const edges = definition?.edges ?? [];

      const temp = JSON.parse(currentPhase.temp ?? '{}') as Record<
        string,
        string
      >;
      const originalCode = temp?.['Original code'] ?? '';
      const pendingCode = temp?.['Pending code'] ?? '';
      const componentId = Number(temp?.['Component ID'] ?? '');

      if (!componentId || isNaN(componentId)) {
        this.logger.warn('Component ID not found in temp');
      }

      const environment: Environment = {
        phases: {},
        code:
          approveChangesDto.decision === 'approve'
            ? (pendingCode ?? originalCode)
            : originalCode,
        startingCode: originalCode,
        workflowExecutionId: Number(request.executionId),
        componentId: Number(componentId),
      };

      this.logger.debug('Environment', environment);
      this.logger.debug('Current phase', currentPhase);
      this.logger.debug('remainingPhases', remainingPhases);

      await this.database
        .update(workflowExecutions)
        .set({
          status: WorkflowExecutionStatus.RUNNING,
        })
        .where(eq(workflowExecutions.id, Number(request.executionId)));

      await this.database
        .update(executionPhase)
        .set({
          status: ExecutionPhaseStatus.COMPLETED,
        })
        .where(eq(executionPhase.id, currentPhase.id));

      // eslint-disable-next-line @typescript-eslint/no-floating-promises --- we don't need to await this
      executeWorkflowPhases(
        this.database,
        environment,
        Number(request.executionId),
        remainingPhases,
        edges,
        execution,
      );

      return {
        $type: 'api.execution.ApproveChangesResponse',
        message:
          approveChangesDto.decision === 'approve'
            ? 'Changes approved, workflow execution resumed'
            : 'Changes rejected, continuing with original code',
        status: WorkflowExecutionStatus.RUNNING,
      } satisfies ExecutionProto.ApproveChangesResponse;
    } catch (error: unknown) {
      console.error(
        `[ERROR] Error approving changes: ${JSON.stringify(error)}`,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async executeWorkflow(
    request: ExecutionProto.ExecuteWorkflowRequest,
  ): Promise<ExecutionProto.Empty> {
    try {
      if (!request.workflowExecutionId) {
        throw new RpcException({
          code: status.INTERNAL,
          message: 'Workflow execution id is required',
        });
      }

      this.logger.debug('executing workflow', request.workflowExecutionId);

      const execution = await this.database.query.workflowExecutions.findFirst({
        where: eq(workflowExecutions.id, Number(request.workflowExecutionId)),
        with: {
          workflow: true,
          executionPhases: true,
        },
      });

      this.logger.debug('execution', execution);

      if (!execution) {
        throw new RpcException('Execution not found');
      }

      const definition = JSON.parse(execution.definition) as { edges?: Edge[] };
      const edges = definition?.edges ?? [];
      const environment: Environment = {
        phases: {},
        code: '',
        startingCode: '',
        workflowExecutionId: Number(request.workflowExecutionId),
        componentId: Number(request.componentId),
      };

      await initializeWorkflowExecution(
        this.database,
        Number(request.workflowExecutionId),
        execution.workflowId,
        request.nextRunAt,
      );

      await initializeWorkflowPhasesStatuses(
        this.database,
        execution.executionPhases,
      );

      await executeWorkflowPhases(
        this.database,
        environment,
        Number(request.workflowExecutionId),
        execution.executionPhases,
        edges,
        execution,
      );

      this.logger.debug(
        `Workflow execution ${
          execution?.status === WorkflowExecutionStatus.WAITING_FOR_APPROVAL
            ? 'paused'
            : 'completed'
        } for workflowId: ${String(execution.workflowId)}`,
      );

      return {
        $type: 'api.execution.Empty',
      };
    } catch (error) {
      console.error('Error in executeWorkflow:', error);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }
}
