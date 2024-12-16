import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import type { DrizzleDatabase } from '../database/merged-schemas';
import { User } from '../database/schemas/users';
import { SaveComponentDto } from './dto/save-component.dto';
import {
  Component,
  components,
  NewComponent,
} from '../database/schemas/components';
import { and, eq } from 'drizzle-orm';
import {
  CodeType,
  type ComponentType,
  SingleComponentApiResponseType,
} from '@repo/types';
import { projects } from '../database/schemas/projects';
import { FavoriteComponentDto } from './dto/favorite-component.dto';
import { streamText } from 'ai';
import { GEMINI_MODEL } from '../common/openai/ai';
import { Response } from 'express';
import { UpdateComponentCodeDto } from './dto/update-component.dto';

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
        // CODE VALUES
        code: components.code,
        e2eTests: components.e2eTests,
        unitTests: components.unitTests,
        mdxDocs: components.mdxDocs,
        tsDocs: components.tsDocs,
        // CDOE VALUES [END]
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
      wasE2ETested: !!component.e2eTests,
      wasUnitTested: !!component.unitTests,
      hasMdxDocs: !!component.mdxDocs,
      hasTypescriptDocs: !!component.tsDocs,
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

  // PATCH /components/:componentId/:codeType
  async updateComponentCode(
    user: User,
    componentId: number,
    codeType: CodeType,
    updateComponentCodeDto: UpdateComponentCodeDto,
  ) {
    // Create type-safe update object
    const updateData = this.createUpdateObject(
      codeType,
      updateComponentCodeDto.content,
    );

    try {
      const [updatedComponent] = await this.database
        .update(components)
        .set({
          ...updateData,
        })
        .where(
          and(eq(components.id, componentId), eq(components.userId, user.id)),
        )
        .returning();

      if (!updatedComponent) {
        throw new NotFoundException(
          `Component with ID ${componentId} not found`,
        );
      }

      return updatedComponent;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update component ${codeType}`,
      );
    }
  }

  private createUpdateObject(
    codeType: CodeType,
    content: string,
  ): Partial<Component> {
    switch (codeType) {
      case 'code':
        return {
          code: content,
          updatedAt: new Date(),
        };
      case 'typescriptDocs':
        return {
          tsDocs: content,
          updatedAt: new Date(),
        };
      case 'unitTests':
        return {
          unitTests: content,
          updatedAt: new Date(),
        };
      case 'e2eTests':
        return {
          e2eTests: content,
          updatedAt: new Date(),
        };
      case 'mdxDocs':
        return {
          mdxDocs: content,
          updatedAt: new Date(),
        };
      default:
        throw new BadRequestException(`Invalid code type: ${codeType}`);
    }
  }
}
