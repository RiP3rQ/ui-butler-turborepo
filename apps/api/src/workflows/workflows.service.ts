import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { and, asc, desc, eq } from 'drizzle-orm';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import {
  AppEdge,
  AppNode,
  ExecutionPhaseStatus,
  WorkflowExecutionPlan,
  WorkflowExecutionStatus,
  WorkflowExecutionTrigger,
  WorkflowStatus,
} from '@repo/types';

import { User } from '../database/schemas/users';
import { NewWorkflow, workflows } from '../database/schemas/workflows';
import { PublishWorkflowDto } from './dto/publish-workflow.dto';
import { RunWorkflowDto } from './dto/run-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { DuplicateWorkflowDto } from './dto/duplicate-workflow.dto';
import {
  executionLog,
  executionPhase,
  workflowExecutions,
} from '../database/schemas/workflow-executions';
import {
  calculateWorkflowCost,
  parseFlowToExecutionPlan,
  ServerTaskRegister,
} from '@repo/tasks';
import { Edge } from '@nestjs/core/inspector/interfaces/edge.interface';
import type { DrizzleDatabase } from '../database/merged-schemas';

@Injectable()
export class WorkflowsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  // GET /workflows
  async getAllUserWorkflows(user: User) {
    const workflowsData = await this.database
      .select()
      .from(workflows)
      .orderBy(desc(workflows.updatedAt))
      .where(eq(workflows.userId, user.id));

    if (!workflowsData) {
      throw new NotFoundException('No workflows data found');
    }

    return workflowsData;
  }

  // GET /workflows?workflowId=1
  async getWorkflowById(user: User, workflowId: number) {
    const [workflowData] = await this.database
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.userId, user.id)));

    if (!workflowData) {
      throw new NotFoundException('Workflow not found');
    }

    return workflowData;
  }

  // POST /workflows
  async createWorkflow(user: User, createWorkflowDto: CreateWorkflowDto) {
    // Workflow initial state
    const initalFlow: {
      nodes: AppNode[];
      edges: AppEdge[];
    } = {
      nodes: [],
      edges: [],
    };

    const newWorkflowData = {
      name: createWorkflowDto.name,
      description: createWorkflowDto.description,
      userId: user.id,
      definition: JSON.stringify(initalFlow),
      status: WorkflowStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies NewWorkflow;

    const [newWorkflow] = await this.database
      .insert(workflows)
      .values(newWorkflowData)
      .returning();

    if (!newWorkflow) {
      throw new NotFoundException('Workflow not created');
    }

    return newWorkflow;
  }

  // Delete /workflows
  async deleteWorkflow(user: User, workflowId: number) {
    const [deletedWorkflow] = await this.database
      .delete(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.userId, user.id)))
      .returning();

    if (!deletedWorkflow) {
      throw new NotFoundException('Workflow not found');
    }

    return deletedWorkflow;
  }

  // POST /workflows/duplicate-workflow
  async duplicateWorkflow(
    user: User,
    duplicateWorkflowDto: DuplicateWorkflowDto,
  ) {
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
      throw new NotFoundException('Workflow not found');
    }

    const newWorkflow = {
      name: duplicateWorkflowDto.name,
      userId: user.id,
      status: WorkflowStatus.DRAFT,
      definition: sourceWorkflow.definition,
      description: duplicateWorkflowDto.description,
    } satisfies NewWorkflow;

    const [duplicatedWorkflow] = await this.database
      .insert(workflows)
      .values(newWorkflow)
      .returning();

    if (!duplicatedWorkflow) {
      throw new NotFoundException('Workflow not duplicated');
    }

    return duplicatedWorkflow;
  }

  // POST /workflows/publish-workflow
  async publishWorkflow(user: User, publishWorkflowDto: PublishWorkflowDto) {
    const [workflowData] = await this.database
      .select()
      .from(workflows)
      .where(eq(workflows.id, publishWorkflowDto.workflowId));

    if (!workflowData) {
      throw new NotFoundException('Workflow not found');
    }

    if (workflowData.status !== WorkflowStatus.DRAFT) {
      throw new BadRequestException('Workflow is not in draft state');
    }

    const flow = JSON.parse(publishWorkflowDto.flowDefinition);
    const result = parseFlowToExecutionPlan(
      flow.nodes as AppNode[],
      flow.edges as Edge[],
    );
    if (result.error) {
      throw new Error('Error parsing flow to execution plan');
    }
    if (!result.executionPlan) {
      throw new Error('Execution plan is not defined');
    }
    const executionPlan: WorkflowExecutionPlan = result.executionPlan;

    const creditsCost = calculateWorkflowCost(flow.nodes as AppNode[]);

    const publishedWorkflowData = {
      name: workflowData.name,
      userId: user.id,
      status: WorkflowStatus.PUBLISHED,
      definition: publishWorkflowDto.flowDefinition,
      executionPlan: JSON.stringify(executionPlan),
      creditsCost,
    };

    // Publish the workflow
    const publishedWorkflow = await this.database
      .update(workflows)
      .set(publishedWorkflowData)
      .where(eq(workflows.id, publishWorkflowDto.workflowId))
      .returning();

    if (!publishedWorkflow) {
      throw new BadRequestException('Error publishing workflow');
    }

    return publishedWorkflow;
  }

  // GET /workflows/unpublish-workflow?workflowId=1
  async unpublishWorkflow(user: User, workflowId: number) {
    const [workflowData] = await this.database
      .select()
      .from(workflows)
      .where(eq(workflows.id, workflowId));

    if (!workflowData) {
      throw new NotFoundException('Workflow not found');
    }

    if (workflowData.status !== WorkflowStatus.PUBLISHED) {
      throw new BadRequestException('Workflow is not in published state');
    }

    const unpublishedWorkflowData = {
      name: workflowData.name,
      userId: user.id,
      status: WorkflowStatus.DRAFT,
      executionPlan: null,
      creditsCost: 0,
    };

    // Unpublish the workflow
    const [unpublishedWorkflow] = await this.database
      .update(workflows)
      .set(unpublishedWorkflowData)
      .where(eq(workflows.id, workflowId))
      .returning();

    if (!unpublishedWorkflow) {
      throw new BadRequestException('Error unpublishing workflow');
    }

    return unpublishedWorkflow;
  }

  // POST /workflows/run-workflow
  async runWorkflow(user: User, runWorkflowDto: RunWorkflowDto) {
    const [workflowData] = await this.database
      .select()
      .from(workflows)
      .where(eq(workflows.id, runWorkflowDto.workflowId));

    if (!workflowData) {
      throw new NotFoundException('Workflow not found');
    }

    let executionPlan: WorkflowExecutionPlan;
    let workflowDefinition = runWorkflowDto.flowDefinition;
    if (workflowData.status === WorkflowStatus.PUBLISHED) {
      if (!workflowData.executionPlan) {
        throw new BadRequestException(
          'Execution plan is not defined in the published workflow',
        );
      }
      executionPlan = JSON.parse(workflowData.executionPlan);
      workflowDefinition = workflowData.definition;
    } else {
      // workflow as draft
      if (!runWorkflowDto.flowDefinition) {
        throw new Error('Flow definition is not defined');
      }
      const flow = JSON.parse(runWorkflowDto.flowDefinition);
      const result = parseFlowToExecutionPlan(flow.nodes, flow.edges);
      if (result.error) {
        throw new Error('Error parsing flow to execution plan');
      }
      if (!result.executionPlan) {
        throw new Error('Execution plan is not defined');
      }
      executionPlan = result.executionPlan;
    }

    const exectionData = {
      workflowId: runWorkflowDto.workflowId,
      userId: user.id,
      status: WorkflowExecutionStatus.RUNNING,
      startedAt: new Date(),
      trigger: WorkflowExecutionTrigger.MANUAL,
      definition: workflowDefinition,
      phases: executionPlan.flatMap((phase) => {
        return phase.nodes.flatMap((node) => {
          return {
            userId: user.id,
            status: ExecutionPhaseStatus.CREATED,
            number: phase.phase,
            node: JSON.stringify(node),
            name: ServerTaskRegister[node.data.type].label,
          };
        });
      }),
    };

    // Save the execution plan to the database
    const [execution] = await this.database
      .insert(workflowExecutions)
      .values(exectionData)
      .returning();

    if (!execution) {
      throw new Error('Error creating execution');
    }

    // TODO: FIX RevaliatePath while rendering the page error

    // !IMPORTANT: Execute the workflow without await to not block the response
    // TODO: FIX THIS
    // executeWorkflowFunction(execution.id);

    return {
      url: `/workflow/runs/${runWorkflowDto.workflowId}/${execution.id}`,
    };
  }

  // PATCH /workflows
  async updateWorkflow(user: User, updateWorkflowDto: UpdateWorkflowDto) {
    const [workflowData] = await this.database
      .select()
      .from(workflows)
      .where(eq(workflows.id, updateWorkflowDto.workflowId));

    if (!workflowData) {
      throw new NotFoundException('Workflow not found');
    }

    // TODO: CHANGE TO WorkflowStatus enum
    if (workflowData.status !== 'DRAFT') {
      throw new BadRequestException('Workflow is not in draft state');
    }

    const updatedData = {
      name: workflowData.name,
      userId: user.id,
      definition: updateWorkflowDto.definition,
      updatedAt: new Date(),
    };

    // Update the workflow
    const [updatedWorkflow] = await this.database
      .update(workflows)
      .set(updatedData)
      .where(
        and(
          eq(workflows.id, updateWorkflowDto.workflowId),
          eq(workflows.userId, user.id),
        ),
      )
      .returning();

    if (!updatedWorkflow) {
      throw new BadRequestException('Error updating workflow');
    }

    return updatedWorkflow;
  }

  // GET /workflows/historic?workflowId=1
  async getHistoricWorkflowExecutions(user: User, workflowId: number) {
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
      throw new NotFoundException('Workflow not found');
    }

    return workflowExecutionsData;
  }

  // GET /workflows/phases?executionId=1
  async getWorkflowExecutions(user: User, executionId: number) {
    const workflowExecutionsWithPhases = await this.database
      .select({
        workflowExecution: workflowExecutions,
        phases: executionPhase,
      })
      .from(workflowExecutions)
      .leftJoin(executionPhase, eq(workflowExecutions.id, executionPhase.id))
      .where(
        and(
          eq(workflowExecutions.id, executionId),
          eq(workflowExecutions.userId, user.id),
        ),
      )
      .orderBy(asc(executionPhase.number));

    if (!workflowExecutionsWithPhases) {
      throw new NotFoundException('Workflow not found');
    }

    // If you need to transform the result to match Prisma's structure
    return {
      ...workflowExecutionsWithPhases[0].workflowExecution,
      phases: workflowExecutionsWithPhases.map((row) => row.phases),
    };
  }

  // GET /workflows/phases?phaseId=1
  async getWorkflowPhase(user: User, phaseId: number) {
    const phaseWithLogs = await this.database
      .select({
        phase: executionPhase,
        logs: executionLog,
      })
      .from(executionPhase)
      .leftJoin(
        workflowExecutions,
        eq(executionPhase.id, workflowExecutions.id),
      )
      .leftJoin(
        executionLog,
        eq(executionPhase.id, executionLog.executionPhaseId),
      )
      .where(
        and(
          eq(executionPhase.id, phaseId),
          eq(executionPhase.userId, user.id),
          eq(workflowExecutions.userId, user.id),
        ),
      )
      .orderBy(asc(executionLog.timestamp));

    if (phaseWithLogs.length === 0) {
      throw new NotFoundException('Workflow phase not found');
    }

    // Transform the result to match Prisma's structure
    return {
      ...phaseWithLogs[0].phase,
      logs: phaseWithLogs
        .filter((row) => row.logs !== null)
        .map((row) => row.logs),
    };
  }
}
