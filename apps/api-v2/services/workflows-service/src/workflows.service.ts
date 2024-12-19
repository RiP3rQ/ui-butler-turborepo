import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { and, asc, desc, eq } from 'drizzle-orm';
import {
  AppNode,
  ExecutionPhaseStatus,
  TaskType,
  WorkflowExecutionPlan,
  WorkflowExecutionStatus,
  WorkflowExecutionTrigger,
  WorkflowStatus,
} from '@repo/types';
import { Edge } from '@nestjs/core/inspector/interfaces/edge.interface';
import {
  DATABASE_CONNECTION,
  type DrizzleDatabase,
  executionLog,
  executionPhase,
  NewWorkflow,
  Workflow,
  WorkflowExecution,
  workflowExecutions,
  workflows,
} from '@app/database';
import {
  CreateWorkflowDto,
  DuplicateWorkflowDto,
  PublishWorkflowDto,
  RunWorkflowDto,
  UpdateWorkflowDto,
  User,
} from '@app/common';
import {
  calculateWorkflowCost,
  createFlowNodeFunction,
  parseFlowToExecutionPlan,
  ServerTaskRegister,
} from '@repo/tasks-registry';

@Injectable()
export class WorkflowsService {
  constructor(
    @Inject('EXECUTION_SERVICE') private readonly executionClient: ClientProxy,
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  async getAllUserWorkflows(user: User) {
    try {
      const workflowsData = await this.database
        .select()
        .from(workflows)
        .orderBy(desc(workflows.updatedAt))
        .where(eq(workflows.userId, user.id));

      if (!workflowsData) {
        throw new RpcException('No workflows data found');
      }

      return workflowsData;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async getWorkflowById(user: User, workflowId: number) {
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

      return workflowData;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async createWorkflow(user: User, createWorkflowDto: CreateWorkflowDto) {
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

      return newWorkflow;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async deleteWorkflow(user: User, workflowId: number) {
    try {
      const [deletedWorkflow] = await this.database
        .delete(workflows)
        .where(and(eq(workflows.id, workflowId), eq(workflows.userId, user.id)))
        .returning();

      if (!deletedWorkflow) {
        throw new RpcException('Workflow not found');
      }

      return deletedWorkflow;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async duplicateWorkflow(
    user: User,
    duplicateWorkflowDto: DuplicateWorkflowDto,
  ) {
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

      return duplicatedWorkflow;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async publishWorkflow(user: User, publishWorkflowDto: PublishWorkflowDto) {
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

      const flow = JSON.parse(publishWorkflowDto.flowDefinition);
      const result = parseFlowToExecutionPlan(
        flow.nodes as AppNode[],
        flow.edges as Edge[],
      );

      if (result.error || !result.executionPlan) {
        throw new RpcException('Error parsing flow to execution plan');
      }

      const creditsCost = calculateWorkflowCost(flow.nodes as AppNode[]);

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

      return publishedWorkflow;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async unpublishWorkflow(user: User, workflowId: number) {
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

      return unpublishedWorkflow;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async runWorkflow(user: User, runWorkflowDto: RunWorkflowDto) {
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

      let executionPlan: WorkflowExecutionPlan;
      let workflowDefinition = runWorkflowDto.flowDefinition;

      if (workflowData.status === WorkflowStatus.PUBLISHED) {
        if (!workflowData.executionPlan) {
          throw new RpcException(
            'Execution plan is not defined in the published workflow',
          );
        }
        executionPlan = JSON.parse(workflowData.executionPlan);
        workflowDefinition = workflowData.definition;
      } else {
        if (!runWorkflowDto.flowDefinition) {
          throw new RpcException('Flow definition is not defined');
        }
        const flow = JSON.parse(runWorkflowDto.flowDefinition);
        const result = parseFlowToExecutionPlan(flow.nodes, flow.edges);
        if (result.error || !result.executionPlan) {
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
        );

        if (phasesData.length > 0) {
          const phases = await tx
            .insert(executionPhase)
            .values(phasesData)
            .returning();

          if (!phases) {
            throw new RpcException('Error creating phases');
          }
        }

        // Instead of direct workflowExecutionsService call, use the microservice
        // skip await for async execution
        this.executionClient.send('execution.run.workflow', {
          query: tokenPayload,
          data: { refreshToken: refreshTokenData },
        }),
          this.workflowExecutionsService.executeWorkflow(
            execution.id,
            runWorkflowDto.componentId,
          );

        return {
          url: `/workflow/runs/${runWorkflowDto.workflowId}/${execution.id}`,
        };
      });
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async updateWorkflow(user: User, updateWorkflowDto: UpdateWorkflowDto) {
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

      return updatedWorkflow;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async getHistoricWorkflowExecutions(user: User, workflowId: number) {
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

      if (!workflowExecutionsData) {
        throw new RpcException('Workflow executions not found');
      }

      return workflowExecutionsData;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async getWorkflowExecutions(user: User, executionId: number) {
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

      if (
        !workflowExecutionsWithPhases ||
        workflowExecutionsWithPhases.length === 0
      ) {
        throw new RpcException('Workflow executions not found');
      }

      return {
        ...workflowExecutionsWithPhases[0].workflowExecution,
        phases: workflowExecutionsWithPhases.map((row) => row.phases),
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async getWorkflowPhase(user: User, phaseId: number) {
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

      if (phaseWithLogs.length === 0) {
        throw new RpcException('Workflow phase not found');
      }

      return {
        ...phaseWithLogs[0].phase,
        logs: phaseWithLogs
          .filter((row) => row.logs !== null)
          .map((row) => row.logs),
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }
}
