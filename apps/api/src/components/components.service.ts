import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import type { DrizzleDatabase } from '../database/merged-schemas';
import { User } from '../database/schemas/users';
import { CreateComponentDto } from './dto/create-new-component.dto';
import { components, NewComponent } from '../database/schemas/components';
import { and, eq } from 'drizzle-orm';
import { SingleComponentApiResponseType } from '@repo/types';
import { projects } from '../database/schemas/projects';

@Injectable()
export class ComponentsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  // GET /components/:projectId/:componentId
  async getSingleComponent(user: User, projectId: number, componentId: number) {
    const [component] = await this.database
      .select({
        id: components.id,
        title: components.title,
        code: components.code,
        projectId: components.projectId,
        createdAt: components.createdAt,
        updatedAt: components.updatedAt,
        projectName: projects.title,
        userId: components.userId,
      })
      .from(components)
      .innerJoin(projects, eq(components.projectId, projects.id))
      .where(
        and(
          eq(components.projectId, projectId),
          eq(components.id, componentId),
          eq(components.userId, user.id),
        ),
      );

    if (!component) {
      throw new NotFoundException('Component not found');
    }

    return {
      ...component,
      wasE2ETested: false,
      wasUnitTested: false,
      hasStorybook: false,
      hasTypescriptDocs: false,
    } satisfies SingleComponentApiResponseType;
  }

  // POST /components
  async createComponent(user: User, createComponentDto: CreateComponentDto) {
    const newComponentData = {
      title: createComponentDto.title,
      userId: user.id,
      code: createComponentDto.code,
      projectId: Number(createComponentDto.projectId),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as NewComponent;

    const [newComponent] = await this.database
      .insert(components)
      .values(newComponentData)
      .returning();

    if (!newComponent) {
      throw new NotFoundException('Component not created');
    }

    return newComponent;
  }
}
