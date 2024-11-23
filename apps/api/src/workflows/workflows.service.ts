import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, desc, eq } from 'drizzle-orm';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import type { AppEdge, AppNode } from '@repo/types';
import { WorkflowExecutionPlan } from '@repo/types';

import { User } from '../database/schemas/users';
import { DatabaseSchemas } from '../database/merged-schemas';
import { workflows } from '../database/schemas/workflows';
import { PublishWorkflowDto } from './dto/publish-workflow.dto';
import { RunWorkflowDto } from './dto/run-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

@Injectable()
export class WorkflowsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<DatabaseSchemas>,
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
      status: 'DRAFT', // TODO: PROPER ENUM FROM TYPES PACKAGE
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [newWorkflow] = await this.database
      .insert(workflows)
      .values(newWorkflowData)
      .returning();

    if (!newWorkflow) {
      throw new NotFoundException('Workflow not created');
    }

    return newWorkflow;
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

    // TODO: CHANGE TO WorkflowStatus enum
    if (workflowData.status !== 'DRAFT') {
      throw new BadRequestException('Workflow is not in draft state');
    }

    const flow = JSON.parse(publishWorkflowDto.flowDefinition);
    // TODO: FIX THIS
    // const result = parseFlowToExecutionPlan(
    //   flow.nodes as AppNode[],
    //   flow.edges as Edge[],
    // );
    const result = {} as any;
    if (result.error) {
      throw new Error('Error parsing flow to execution plan');
    }
    if (!result.executionPlan) {
      throw new Error('Execution plan is not defined');
    }
    const executionPlan: WorkflowExecutionPlan = result.executionPlan;

    // TODO: FIX THIS
    // const creditsCost = calculateWorkflowCost(flow.nodes as AppNode[]);
    const creditsCost = 0;

    // Publish the workflow
    const publishedWorkflow = await this.database
      .update(workflows)
      .set({
        //@ts-ignore // TODO: CHANGE TO WorkflowStatus enum
        status: 'PUBLISHED',
        definition: publishWorkflowDto.flowDefinition,
        executionPlan: JSON.stringify(executionPlan),
        creditsCost,
      })
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

    // TODO: CHANGE TO WorkflowStatus enum
    if (workflowData.status !== 'PUBLISHED') {
      throw new BadRequestException('Workflow is not in published state');
    }

    // Unpublish the workflow
    const [unpublishedWorkflow] = await this.database
      .update(workflows)
      .set({
        //@ts-ignore // TODO: CHANGE TO WorkflowStatus enum
        status: 'DRAFT',
        executionPlan: null,
        creditsCost: 0,
      })
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
    // TODO: FIX THIS TO USE WorkflowStatus enum
    if (workflowData.status === 'PUBLISHED') {
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
      // TODO: FIX THIS
      // const result = parseFlowToExecutionPlan(flow.nodes, flow.edges);
      const result = {} as any;
      if (result.error) {
        throw new Error('Error parsing flow to execution plan');
      }
      if (!result.executionPlan) {
        throw new Error('Execution plan is not defined');
      }
      executionPlan = result.executionPlan;
    }

    // Save the execution plan to the database
    const [execution] = await this.database
      .insert(workflows)
      .values({
        // @ts-ignore // TODO: FIX THIS
        workflowId: runWorkflowDto.workflowId,
        userId: user.id,
        status: 'PENDING', // TODO: PROPER ENUM FROM TYPES PACKAGE
        startedAt: new Date(),
        trigger: 'MANUAL', // TODO: PROPER ENUM FROM TYPES PACKAGE
        definition: workflowDefinition,
        phases: executionPlan.flatMap((phase) => {
          return phase.nodes.flatMap((node) => {
            return {
              userId: user.id,
              status: 'CREATED', // TODO: PROPER ENUM FROM TYPES PACKAGE
              number: phase.phase,
              node: JSON.stringify(node),
              name: 'TEST', // TaskRegistry[node.data.type].label,
            };
          });
        }),
      })
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

    // Update the workflow
    const [updatedWorkflow] = await this.database
      .update(workflows)
      .set({
        //@ts-ignore // TODO: CHANGE TO WorkflowStatus enum
        definition: updateWorkflowDto.definition,
        updatedAt: new Date(),
      })
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
}
