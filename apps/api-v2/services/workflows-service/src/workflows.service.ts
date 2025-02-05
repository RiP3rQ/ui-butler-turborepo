import {
  CreateWorkflowDto,
  dateToTimestamp,
  DuplicateWorkflowDto,
  PublishWorkflowDto,
  RunWorkflowDto,
  UpdateWorkflowDto,
  User,
} from '@microservices/common';
import {
  and,
  asc,
  DATABASE_CONNECTION,
  desc,
  type DrizzleDatabase,
  eq,
  executionLog,
  executionPhase,
  NewWorkflow,
  Workflow,
  WorkflowExecution,
  workflowExecutions,
  workflows,
} from '@microservices/database';
import { type ExecutionProto, type WorkflowsProto } from '@microservices/proto';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Edge } from '@nestjs/core/inspector/interfaces/edge.interface';
import { type ClientGrpc, RpcException } from '@nestjs/microservices';
import {
  calculateWorkflowCost,
  createFlowNodeFunction,
  parseFlowToExecutionPlan,
  ServerTaskRegister,
} from '@shared/tasks-registry';
import {
  AppNode,
  ExecutionPhaseStatus,
  IExecutionPhaseStatus,
  TaskType,
  WorkflowExecutionPlan,
  WorkflowExecutionStatus,
  WorkflowExecutionTrigger,
  WorkflowStatus,
} from '@shared/types';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WorkflowsService implements OnModuleInit {
  private executionsService: ExecutionProto.ExecutionsServiceClient;

  constructor(
    @Inject('EXECUTIONS_SERVICE')
    private readonly executionsClient: ClientGrpc,
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  public onModuleInit(): void {
    this.executionsService =
      this.executionsClient.getService<ExecutionProto.ExecutionsServiceClient>(
        'ExecutionsService',
      );
  }

  public async getAllUserWorkflows(
    user: User,
  ): Promise<WorkflowsProto.WorkflowsResponse> {
    try {
      const workflowsData = await this.database
        .select()
        .from(workflows)
        .orderBy(desc(workflows.updatedAt))
        .where(eq(workflows.userId, user.id));

      if (workflowsData.length === 0) {
        throw new RpcException('No workflows data found');
      }

      return {
        $type: 'api.workflows.WorkflowsResponse',
        workflows: workflowsData.map((workflow) => ({
          $type: 'api.workflows.Workflow',
          ...workflow,
          description: workflow.description ?? '',
          userId: Number(workflow.userId),
          status: workflow.status ?? WorkflowStatus.DRAFT,
          executionPlan: workflow.executionPlan ?? '',
          creditsCost: workflow.creditsCost ?? 0,
          createdAt: dateToTimestamp(workflow.createdAt),
          updatedAt: dateToTimestamp(workflow.updatedAt),
          lastRunAt: workflow.lastRunAt
            ? dateToTimestamp(workflow.lastRunAt)
            : undefined,
          lastRunId: workflow.lastRunId ? workflow.lastRunId : undefined,
          lastRunStatus: workflow.lastRunStatus
            ? workflow.lastRunStatus
            : undefined,
          nextRunAt: workflow.nextRunAt
            ? dateToTimestamp(workflow.nextRunAt)
            : undefined,
        })),
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  public async getWorkflowById(
    user: User,
    workflowId: number,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    try {
      const [workflowData] = await this.database
        .select()
        .from(workflows)
        .where(
          and(eq(workflows.id, workflowId), eq(workflows.userId, user.id)),
        );

      if (!workflowData) {
        throw new RpcException('Workflow not found');
      }

      return {
        $type: 'api.workflows.WorkflowResponse',
        workflow: {
          $type: 'api.workflows.Workflow',
          ...workflowData,
          description: workflowData.description ?? '',
          status: workflowData.status ?? WorkflowStatus.DRAFT,
          executionPlan: workflowData.executionPlan ?? '',
          creditsCost: workflowData.creditsCost ?? 0,
          createdAt: dateToTimestamp(workflowData.createdAt),
          updatedAt: dateToTimestamp(workflowData.updatedAt),
          lastRunAt: workflowData.lastRunAt
            ? dateToTimestamp(workflowData.lastRunAt)
            : undefined,
          lastRunId: workflowData.lastRunId
            ? workflowData.lastRunId
            : undefined,
          lastRunStatus: workflowData.lastRunStatus
            ? workflowData.lastRunStatus
            : undefined,
          nextRunAt: workflowData.nextRunAt
            ? dateToTimestamp(workflowData.nextRunAt)
            : undefined,
        },
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  public async createWorkflow(
    user: User,
    createWorkflowDto: CreateWorkflowDto,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    try {
      const initialFlow = {
        nodes: [createFlowNodeFunction(TaskType.SET_CODE_CONTEXT)],
        edges: [],
      };

      const newWorkflowData: NewWorkflow = {
        name: createWorkflowDto.name,
        description: createWorkflowDto.description,
        userId: user.id,
        definition: JSON.stringify(initialFlow),
        status: WorkflowStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [newWorkflow] = await this.database
        .insert(workflows)
        .values(newWorkflowData)
        .returning();

      if (!newWorkflow) {
        throw new RpcException('Workflow not created');
      }

      return {
        $type: 'api.workflows.WorkflowResponse',
        ...newWorkflow,
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  public async deleteWorkflow(
    user: User,
    workflowId: number,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    try {
      const [deletedWorkflow] = await this.database
        .delete(workflows)
        .where(and(eq(workflows.id, workflowId), eq(workflows.userId, user.id)))
        .returning();

      if (!deletedWorkflow) {
        throw new RpcException('Workflow not found');
      }

      return {
        $type: 'api.workflows.WorkflowResponse',
        ...deletedWorkflow,
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  public async duplicateWorkflow(
    user: User,
    duplicateWorkflowDto: DuplicateWorkflowDto,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    try {
      const [sourceWorkflow] = await this.database
        .select()
        .from(workflows)
        .where(
          and(
            eq(workflows.id, duplicateWorkflowDto.workflowId),
            eq(workflows.userId, user.id),
          ),
        );

      if (!sourceWorkflow) {
        throw new RpcException('Workflow not found');
      }

      const newWorkflow: NewWorkflow = {
        name: duplicateWorkflowDto.name,
        userId: user.id,
        status: WorkflowStatus.DRAFT,
        definition: sourceWorkflow.definition,
        description: duplicateWorkflowDto.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [duplicatedWorkflow] = await this.database
        .insert(workflows)
        .values(newWorkflow)
        .returning();

      if (!duplicatedWorkflow) {
        throw new RpcException('Workflow not duplicated');
      }

      return {
        $type: 'api.workflows.WorkflowResponse',
        ...duplicatedWorkflow,
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  public async publishWorkflow(
    user: User,
    publishWorkflowDto: PublishWorkflowDto,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    try {
      const [workflowData] = await this.database
        .select()
        .from(workflows)
        .where(
          and(
            eq(workflows.id, publishWorkflowDto.workflowId),
            eq(workflows.userId, user.id),
          ),
        );

      if (!workflowData) {
        throw new RpcException('Workflow not found');
      }

      if (workflowData.status !== WorkflowStatus.DRAFT) {
        throw new RpcException('Workflow is not in draft state');
      }

      const flow = JSON.parse(publishWorkflowDto.flowDefinition) as {
        nodes: AppNode[];
        edges: Edge[];
      };
      const result = parseFlowToExecutionPlan(flow.nodes, flow.edges);

      if (result.error ?? !result.executionPlan) {
        throw new RpcException('Error parsing flow to execution plan');
      }

      const creditsCost = calculateWorkflowCost(flow.nodes);

      const publishedWorkflowData: Partial<Workflow> = {
        status: WorkflowStatus.PUBLISHED,
        definition: publishWorkflowDto.flowDefinition,
        executionPlan: JSON.stringify(result.executionPlan),
        creditsCost,
        updatedAt: new Date(),
      };

      const [publishedWorkflow] = await this.database
        .update(workflows)
        .set(publishedWorkflowData)
        .where(
          and(
            eq(workflows.id, publishWorkflowDto.workflowId),
            eq(workflows.userId, user.id),
          ),
        )
        .returning();

      if (!publishedWorkflow) {
        throw new RpcException('Error publishing workflow');
      }

      return {
        $type: 'api.workflows.WorkflowResponse',
        ...publishedWorkflow,
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  public async unpublishWorkflow(
    _user: User,
    workflowId: number,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    try {
      const [workflowData] = await this.database
        .select()
        .from(workflows)
        .where(eq(workflows.id, workflowId));

      if (!workflowData) {
        throw new RpcException('Workflow not found');
      }

      if (workflowData.status !== WorkflowStatus.PUBLISHED) {
        throw new RpcException('Workflow is not in published state');
      }

      const unpublishedWorkflowData: Partial<Workflow> = {
        status: WorkflowStatus.DRAFT,
        executionPlan: null,
        creditsCost: 0,
        updatedAt: new Date(),
      };

      const [unpublishedWorkflow] = await this.database
        .update(workflows)
        .set(unpublishedWorkflowData)
        .where(eq(workflows.id, workflowId))
        .returning();

      if (!unpublishedWorkflow) {
        throw new RpcException('Error unpublishing workflow');
      }

      return {
        $type: 'api.workflows.WorkflowResponse',
        ...unpublishedWorkflow,
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  public async runWorkflow(
    user: User,
    runWorkflowDto: RunWorkflowDto,
  ): Promise<WorkflowsProto.RunWorkflowResponse> {
    try {
      const [workflowData] = await this.database
        .select()
        .from(workflows)
        .where(
          and(
            eq(workflows.id, runWorkflowDto.workflowId),
            eq(workflows.userId, user.id),
          ),
        );

      if (!workflowData) {
        throw new RpcException('Workflow not found');
      }

      let executionPlan: WorkflowExecutionPlan | null = null;
      let workflowDefinition = runWorkflowDto.flowDefinition;

      if (workflowData.status === WorkflowStatus.PUBLISHED) {
        if (!workflowData.executionPlan) {
          throw new RpcException(
            'Execution plan is not defined in the published workflow',
          );
        }
        executionPlan = JSON.parse(
          workflowData.executionPlan,
        ) as WorkflowExecutionPlan;
        workflowDefinition = workflowData.definition;
      } else {
        if (!runWorkflowDto.flowDefinition) {
          throw new RpcException('Flow definition is not defined');
        }
        const flow = JSON.parse(runWorkflowDto.flowDefinition) as {
          nodes: AppNode[];
          edges: Edge[];
        };
        const result = parseFlowToExecutionPlan(flow.nodes, flow.edges);
        if (result.error ?? !result.executionPlan) {
          throw new RpcException('Error parsing flow to execution plan');
        }
        executionPlan = result.executionPlan;
      }

      return await this.database.transaction(async (tx) => {
        const executionData = {
          workflowId: runWorkflowDto.workflowId,
          userId: user.id,
          status: WorkflowExecutionStatus.RUNNING,
          startedAt: new Date(),
          trigger: WorkflowExecutionTrigger.MANUAL,
          definition: workflowDefinition,
        } satisfies Partial<WorkflowExecution>;

        const [execution] = await tx
          .insert(workflowExecutions)
          .values(executionData)
          .returning();

        if (!execution) {
          throw new RpcException('Error creating execution');
        }

        const phasesData = executionPlan.flatMap((phase) =>
          phase.nodes.map((node) => ({
            workflowExecutionId: execution.id,
            userId: user.id,
            status: ExecutionPhaseStatus.CREATED,
            number: phase.phase,
            node: JSON.stringify(node),
            name: ServerTaskRegister[node.data.type].label,
          })),
        ) as {
          workflowExecutionId: number;
          userId: number;
          status: IExecutionPhaseStatus;
          number: number;
          node: string;
          name: string;
        }[];

        if (phasesData.length > 0) {
          const phases = await tx
            .insert(executionPhase)
            .values(phasesData)
            .returning();

          if (phases.length === 0) {
            throw new RpcException('Error creating phases');
          }
        }

        // Executing the workflow but without the `await` as we don't need to wait for it to finish

        this.executeWorkflow({
          $type: 'api.execution.ExecuteWorkflowRequest',
          workflowExecutionId: execution.id,
          componentId: runWorkflowDto.componentId ?? 0,
        });

        return {
          $type: 'api.workflows.RunWorkflowResponse',
          url: `/workflow/runs/${String(runWorkflowDto.workflowId)}/${String(execution.id)}`,
        };
      });
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  private async executeWorkflow(
    request: ExecutionProto.ExecuteWorkflowRequest,
  ): Promise<ExecutionProto.Empty> {
    try {
      console.log('Executing workflow', request);
      return await firstValueFrom(this.executionsService.execute(request));
    } catch (error) {
      console.error('Error executing workflow', error);
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  public async updateWorkflow(
    user: User,
    updateWorkflowDto: UpdateWorkflowDto,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    try {
      const [workflowData] = await this.database
        .select()
        .from(workflows)
        .where(eq(workflows.id, updateWorkflowDto.workflowId));

      if (!workflowData) {
        throw new RpcException('Workflow not found');
      }

      if (workflowData.status !== WorkflowStatus.DRAFT) {
        throw new RpcException('Workflow is not in draft state');
      }

      const updatedWorkflowData: Partial<Workflow> = {
        definition: updateWorkflowDto.definition,
        updatedAt: new Date(),
      };

      const [updatedWorkflow] = await this.database
        .update(workflows)
        .set(updatedWorkflowData)
        .where(
          and(
            eq(workflows.id, updateWorkflowDto.workflowId),
            eq(workflows.userId, user.id),
          ),
        )
        .returning();

      if (!updatedWorkflow) {
        throw new RpcException('Error updating workflow');
      }

      return {
        $type: 'api.workflows.WorkflowResponse',
        ...updatedWorkflow,
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  public async getHistoricWorkflowExecutions(
    user: User,
    workflowId: number,
  ): Promise<WorkflowsProto.WorkflowExecutionsResponse> {
    try {
      const workflowExecutionsData = await this.database
        .select()
        .from(workflowExecutions)
        .where(
          and(
            eq(workflowExecutions.workflowId, workflowId),
            eq(workflowExecutions.userId, user.id),
          ),
        )
        .orderBy(desc(workflowExecutions.createdAt));

      return {
        $type: 'api.workflows.WorkflowExecutionsResponse',
        executions: workflowExecutionsData.map((execution) => ({
          $type: 'api.workflows.WorkflowExecution',
          ...execution,
          userId: Number(execution.userId),
          createdAt: dateToTimestamp(execution.createdAt),
          startedAt: execution.startedAt
            ? dateToTimestamp(execution.startedAt)
            : undefined,
          endedAt: execution.completedAt
            ? dateToTimestamp(execution.completedAt)
            : undefined,
          completedAt: execution.completedAt
            ? dateToTimestamp(execution.completedAt)
            : undefined,
          creditsConsumed: execution.creditsConsumed
            ? Number(execution.creditsConsumed)
            : 0,
        })),
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  public async getWorkflowExecutions(
    user: User,
    executionId: number,
  ): Promise<WorkflowsProto.WorkflowExecutionDetailResponse> {
    try {
      const workflowExecutionsWithPhases = await this.database
        .select({
          workflowExecution: workflowExecutions,
          phases: executionPhase,
        })
        .from(workflowExecutions)
        .leftJoin(
          executionPhase,
          eq(workflowExecutions.id, executionPhase.workflowExecutionId),
        )
        .where(
          and(
            eq(workflowExecutions.id, executionId),
            eq(workflowExecutions.userId, user.id),
          ),
        )
        .orderBy(asc(executionPhase.number));

      if (workflowExecutionsWithPhases.length === 0) {
        throw new RpcException('Workflow executions not found');
      }

      return {
        $type: 'api.workflows.WorkflowExecutionDetailResponse',
        execution: {
          $type: 'api.workflows.WorkflowExecution',
          ...workflowExecutionsWithPhases[0]?.workflowExecution,
          id: workflowExecutionsWithPhases[0]?.workflowExecution?.id ?? 0,
          workflowId:
            workflowExecutionsWithPhases[0]?.workflowExecution?.workflowId ?? 0,
          status:
            workflowExecutionsWithPhases[0]?.workflowExecution?.status ??
            WorkflowStatus.DRAFT,
          userId: Number(
            workflowExecutionsWithPhases[0]?.workflowExecution?.userId,
          ),
          definition:
            workflowExecutionsWithPhases[0]?.workflowExecution?.definition ??
            '',
          creditsConsumed:
            workflowExecutionsWithPhases[0]?.workflowExecution
              ?.creditsConsumed ?? undefined,
          createdAt: workflowExecutionsWithPhases[0]?.workflowExecution
            ?.createdAt
            ? dateToTimestamp(
                workflowExecutionsWithPhases[0].workflowExecution.createdAt,
              )
            : undefined,
          startedAt: workflowExecutionsWithPhases[0]?.workflowExecution
            ?.startedAt
            ? dateToTimestamp(
                workflowExecutionsWithPhases[0].workflowExecution.startedAt,
              )
            : undefined,
          completedAt: workflowExecutionsWithPhases[0]?.workflowExecution
            ?.completedAt
            ? dateToTimestamp(
                workflowExecutionsWithPhases[0].workflowExecution.completedAt,
              )
            : undefined,
        } satisfies WorkflowsProto.WorkflowExecution,
        phases: workflowExecutionsWithPhases.map(
          (row) =>
            ({
              $type: 'api.workflows.ExecutionPhase',
              ...row.phases,
              id: row.phases?.id ?? 0,
              name: row.phases?.name ?? '',
              workflowExecutionId: row.phases?.workflowExecutionId ?? 0,
              userId: row.phases?.userId ?? 0,
              status: row.phases?.status ?? '',
              number: row.phases?.number ?? 0,
              startedAt: row.phases?.startedAt
                ? dateToTimestamp(row.phases.startedAt)
                : undefined,
              completedAt: row.phases?.completedAt
                ? dateToTimestamp(row.phases.completedAt)
                : undefined,
              creditsCost: row.phases?.creditsCost
                ? Number(row.phases.creditsCost)
                : undefined,
              inputs: row.phases?.inputs
                ? JSON.stringify(JSON.parse(row.phases.inputs))
                : undefined,
              outputs: row.phases?.outputs
                ? JSON.stringify(JSON.parse(row.phases.outputs))
                : undefined,
            }) satisfies WorkflowsProto.ExecutionPhase,
        ),
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  public async getWorkflowPhase(
    user: User,
    phaseId: number,
  ): Promise<WorkflowsProto.PhaseResponse> {
    try {
      const phaseWithLogs = await this.database
        .select({
          phase: executionPhase,
          logs: executionLog,
        })
        .from(executionPhase)
        .leftJoin(
          workflowExecutions,
          eq(executionPhase.workflowExecutionId, workflowExecutions.id),
        )
        .leftJoin(
          executionLog,
          eq(executionPhase.id, executionLog.executionPhaseId),
        )
        .where(
          and(
            eq(executionPhase.id, phaseId),
            eq(executionPhase.userId, user.id),
          ),
        )
        .orderBy(asc(executionLog.timestamp));

      if (phaseWithLogs.length === 0 || !phaseWithLogs[0]) {
        throw new RpcException('Workflow phase not found');
      }

      return {
        $type: 'api.workflows.PhaseResponse',
        phase: {
          $type: 'api.workflows.ExecutionPhase',
          ...phaseWithLogs[0].phase,
          userId: Number(phaseWithLogs[0].phase.userId),
          startedAt: phaseWithLogs[0].phase.startedAt
            ? dateToTimestamp(phaseWithLogs[0].phase.startedAt)
            : undefined,
          completedAt: phaseWithLogs[0].phase.completedAt
            ? dateToTimestamp(phaseWithLogs[0].phase.completedAt)
            : undefined,
          creditsCost: phaseWithLogs[0].phase.creditsCost
            ? Number(phaseWithLogs[0].phase.creditsCost)
            : 0,
          inputs: phaseWithLogs[0].phase.inputs
            ? JSON.stringify(JSON.parse(phaseWithLogs[0].phase.inputs))
            : undefined,
          outputs: phaseWithLogs[0].phase.outputs
            ? JSON.stringify(JSON.parse(phaseWithLogs[0].phase.outputs))
            : undefined,
        },
        logs: phaseWithLogs
          .filter((row) => row.logs !== null)
          .map((row) => ({
            $type: 'api.workflows.ExecutionLog',
            ...row.logs,
            id: row.logs?.id ?? 0,
            executionPhaseId: row.logs?.executionPhaseId ?? 0,
            message: row.logs?.message ?? '',
            level: row.logs?.logLevel ?? '',
            logLevel: row.logs?.logLevel ?? '',
            timestamp: dateToTimestamp(row.logs?.timestamp ?? ''),
          })),
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }
}
