import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import type { DrizzleDatabase } from '../database/merged-schemas';
import { User } from '../database/schemas/users';
import { SaveComponentDto } from './dto/save-component.dto';
import { components, NewComponent } from '../database/schemas/components';
import { and, eq } from 'drizzle-orm';
import {
  type ComponentType,
  SingleComponentApiResponseType,
} from '@repo/types';
import { projects } from '../database/schemas/projects';
import { FavoriteComponentDto } from './dto/favorite-component.dto';
import { streamText } from 'ai';
import { GEMINI_MODEL } from '../common/openai/ai';
import { Response } from 'express';

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
  async saveComponent(user: User, saveComponentDto: SaveComponentDto) {
    const newComponentData = {
      title: saveComponentDto.title,
      userId: user.id,
      code: saveComponentDto.code,
      projectId: Number(saveComponentDto.projectId),
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

  // POST /components/favorite
  async favoriteComponent(
    user: User,
    favoriteComponentDto: FavoriteComponentDto,
  ) {
    const { projectId, componentId, favoriteValue } = favoriteComponentDto;

    const updatedComponent = {
      isFavorite: favoriteValue,
      updatedAt: new Date(),
    } as Partial<NewComponent>;

    const [component] = await this.database
      .update(components)
      .set(updatedComponent)
      .where(
        and(
          eq(components.projectId, projectId),
          eq(components.id, componentId),
          eq(components.userId, user.id),
        ),
      )
      .returning();

    if (!component) {
      throw new NotFoundException('Component not found');
    }

    return component satisfies ComponentType;
  }

  // POST /components/generate
  async generateComponentStream(prompt: string, res: Response) {
    try {
      const enhancedPrompt = this.enhancePrompt(prompt);

      const result = streamText({
        model: GEMINI_MODEL,
        prompt: enhancedPrompt,
      });

      return result.pipeDataStreamToResponse(res);
    } catch (error) {
      console.error('Error generating component:', error);
      throw new Error('Failed to generate component');
    }
  }

  private enhancePrompt(prompt: string): string {
    return `
      Generate a React component based on the following description:
      ${prompt}
      
      Requirements:
      - Use TypeScript with strict type checking
      - Follow React best practices and modern patterns
      - Include proper types and interfaces
      - Implement error boundaries where appropriate
      - Add proper loading states
      - Ensure accessibility (ARIA labels, keyboard navigation)
      - Add basic documentation and comments
      - Include proper prop validation
      - Add basic responsive design
      - Include basic error handling
      
      Return only the component code without any additional explanation.
    `.trim();
  }
}
