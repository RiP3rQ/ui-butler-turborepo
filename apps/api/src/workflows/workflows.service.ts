import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { desc, eq } from 'drizzle-orm';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import type { AppEdge, AppNode } from '@repo/types';
import { WorkflowExecutionPlan, WorkflowStatus } from '@repo/types';

import { User } from '../database/schemas/users';
import { DatabaseSchemas } from '../database/merged-schemas';
import { workflows } from '../database/schemas/workflows';
import { PublishWorkflowDto } from './dto/publish-workflow.dto';
import { Edge } from '@nestjs/core/inspector/interfaces/edge.interface';
import { parseFlowToExecutionPlan } from '../lib/parse-flow-to-execution-plan';
import { calculateWorkflowCost } from '../lib/calculate-workflow-cost';

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

  // GET /workflows/publish-workflow/:workflowId
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

    // Publish the workflow
    const publishedWorkflow = await this.database
      .update(workflows)
      .set({
        status: WorkflowStatus.PUBLISHED,
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
}
