import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { desc, eq } from 'drizzle-orm';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import type { AppEdge, AppNode } from '@repo/types/src/appNode';

import { User } from '../database/schemas/users';
import { DatabaseSchemas } from '../database/merged-schemas';
import { workflows } from '../database/schemas/workflows';

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
}
