import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { and, eq } from 'drizzle-orm';
import {
  CodeType,
  ComponentType,
  SingleComponentApiResponseType,
} from '@repo/types';
import { generateText, streamText } from 'ai';
import { Response } from 'express';
import { singleGeneratedPrompts } from '@repo/prompts';
import {
  Component,
  components,
  DATABASE_CONNECTION,
  type DrizzleDatabase,
  NewComponent,
  projects,
} from '@app/database';
import {
  FavoriteComponentDto,
  GEMINI_MODEL,
  GenerateCodeDto,
  SaveComponentDto,
  UpdateComponentCodeDto,
  User,
} from '@app/common';

@Injectable()
export class ComponentsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  async getSingleComponent(
    user: User,
    projectId: number,
    componentId: number,
  ): Promise<SingleComponentApiResponseType> {
    try {
      const [component] = await this.database
        .select({
          id: components.id,
          title: components.title,
          code: components.code,
          e2eTests: components.e2eTests,
          unitTests: components.unitTests,
          mdxDocs: components.mdxDocs,
          tsDocs: components.tsDocs,
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
        throw new RpcException('Component not found');
      }

      return {
        ...component,
        wasE2ETested: !!component.e2eTests,
        wasUnitTested: !!component.unitTests,
        hasMdxDocs: !!component.mdxDocs,
        hasTypescriptDocs: !!component.tsDocs,
      };
    } catch (error) {
      console.error(error);
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async saveComponent(
    user: User,
    saveComponentDto: SaveComponentDto,
  ): Promise<ComponentType> {
    try {
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
        throw new RpcException('Failed to create component');
      }

      return newComponent;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async favoriteComponent(
    user: User,
    favoriteComponentDto: FavoriteComponentDto,
  ): Promise<ComponentType> {
    try {
      const { projectId, componentId, favoriteValue } = favoriteComponentDto;

      const componentData = {
        isFavorite: favoriteValue,
        updatedAt: new Date(),
      } as Partial<Component>;

      const [component] = await this.database
        .update(components)
        .set(componentData)
        .where(
          and(
            eq(components.projectId, projectId),
            eq(components.id, componentId),
            eq(components.userId, user.id),
          ),
        )
        .returning();

      if (!component) {
        throw new RpcException('Component not found');
      }

      return component;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  private enhancePrompt(prompt: string): string {
    return singleGeneratedPrompts['generateComponent'](prompt).trim();
  }

  async generateComponentStream(prompt: string, res: Response): Promise<void> {
    try {
      const enhancedPrompt = this.enhancePrompt(prompt);
      const result = streamText({
        model: GEMINI_MODEL,
        prompt: enhancedPrompt,
      });
      return result.pipeDataStreamToResponse(res);
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async updateComponentCode(
    user: User,
    componentId: number,
    codeType: CodeType,
    updateComponentCodeDto: UpdateComponentCodeDto,
  ): Promise<ComponentType> {
    try {
      const updateData = this.createUpdateObject(
        codeType,
        updateComponentCodeDto.content,
      );

      const [updatedComponent] = await this.database
        .update(components)
        .set(updateData)
        .where(
          and(eq(components.id, componentId), eq(components.userId, user.id)),
        )
        .returning();

      if (!updatedComponent) {
        throw new RpcException(`Component with ID ${componentId} not found`);
      }

      return updatedComponent;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  private createUpdateObject(
    codeType: CodeType,
    content: string,
  ): Partial<Component> {
    const baseUpdate = { updatedAt: new Date() };

    switch (codeType) {
      case 'code':
        return { ...baseUpdate, code: content };
      case 'typescriptDocs':
        return { ...baseUpdate, tsDocs: content };
      case 'unitTests':
        return { ...baseUpdate, unitTests: content };
      case 'e2eTests':
        return { ...baseUpdate, e2eTests: content };
      case 'mdxDocs':
        return { ...baseUpdate, mdxDocs: content };
      default:
        throw new RpcException(`Invalid code type: ${codeType}`);
    }
  }

  async generateCodeFunction(
    user: User,
    body: GenerateCodeDto,
  ): Promise<ComponentType> {
    try {
      const { componentId, codeType } = body;

      const [component] = await this.database
        .select({
          id: components.id,
          code: components.code,
          tsDocs: components.tsDocs,
          unitTests: components.unitTests,
          e2eTests: components.e2eTests,
          mdxDocs: components.mdxDocs,
        })
        .from(components)
        .where(
          and(eq(components.id, componentId), eq(components.userId, user.id)),
        );

      if (!component) {
        throw new RpcException('Component not found');
      }

      const generatedCode = await this.generateCode(codeType, component.code);
      const updateData = this.createUpdateObject(codeType, generatedCode);

      const [updatedComponent] = await this.database
        .update(components)
        .set(updateData)
        .where(
          and(eq(components.id, componentId), eq(components.userId, user.id)),
        )
        .returning();

      if (!updatedComponent) {
        throw new RpcException('Failed to update component');
      }

      return updatedComponent;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  private async generateCode(
    codeType: CodeType,
    sourceCode: string,
  ): Promise<string> {
    if (codeType === 'code') {
      return sourceCode;
    }

    const prompt = singleGeneratedPrompts[codeType]?.(sourceCode);
    if (!prompt) {
      throw new RpcException(`No prompt defined for code type: ${codeType}`);
    }

    try {
      const { text } = await generateText({
        model: GEMINI_MODEL,
        prompt,
      });

      return text
        .replace(/^```[\w-]*\n/, '')
        .replace(/\n```$/, '')
        .trim();
    } catch (error) {
      console.error('Error generating code:', error);
      throw new RpcException(`Failed to generate ${codeType}`);
    }
  }
}
