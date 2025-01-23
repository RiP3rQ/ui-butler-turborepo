import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CodeType } from '@shared/types';
import { generateText, pipeDataStreamToResponse, streamText } from 'ai';
import { type Response } from 'express';
import { singleGeneratedPrompts } from '@shared/prompts';
import {
  and,
  Component,
  components,
  DATABASE_CONNECTION,
  type DrizzleDatabase,
  eq,
  NewComponent,
  projects,
} from '@app/database';
import {
  GET_GEMINI_MODEL,
  GenerateCodeDto,
  SaveComponentDto,
  UpdateComponentCodeDto,
  User,
} from '@app/common';
import { ComponentsProto } from '@app/proto';

@Injectable()
export class ComponentsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  public async getSingleComponent(
    user: User,
    projectId: number,
    componentId: number,
  ): Promise<ComponentsProto.Component> {
    try {
      console.log('user', user);
      console.log('projectId', projectId);
      console.log('componentId', componentId);

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
        $type: 'api.components.Component',
        id: component.id,
        title: component.title,
        code: component.code,
        e2eTests: component.e2eTests ?? '',
        unitTests: component.unitTests ?? '',
        mdxDocs: component.mdxDocs ?? '',
        tsDocs: component.tsDocs ?? '',
        projectId: component.projectId,
        createdAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: component.createdAt.getTime(),
          nanos: component.createdAt.getMilliseconds(),
        },
        updatedAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: component.updatedAt.getTime(),
          nanos: component.updatedAt.getMilliseconds(),
        },
        projectName: component.projectName,
        userId: component.userId,
        wasE2eTested: Boolean(component.e2eTests),
        wasUnitTested: Boolean(component.unitTests),
        hasMdxDocs: Boolean(component.mdxDocs),
        hasTypescriptDocs: Boolean(component.tsDocs),
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  public async saveComponent(
    user: User,
    saveComponentDto: SaveComponentDto,
  ): Promise<ComponentsProto.Component> {
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

      return {
        $type: 'api.components.Component',
        id: newComponent.id,
        title: newComponent.title,
        code: newComponent.code,
        e2eTests: '',
        unitTests: '',
        mdxDocs: '',
        tsDocs: '',
        projectId: newComponent.projectId,
        createdAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: newComponent.createdAt.getTime(),
          nanos: newComponent.createdAt.getMilliseconds(),
        },
        updatedAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: newComponent.updatedAt.getTime(),
          nanos: newComponent.updatedAt.getMilliseconds(),
        },
        projectName: '',
        userId: newComponent.userId,
        wasE2eTested: false,
        wasUnitTested: false,
        hasMdxDocs: false,
        hasTypescriptDocs: false,
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  public async favoriteComponent(
    user: User,
    favoriteComponentDto: { componentId: number; isFavorite: boolean },
  ): Promise<ComponentsProto.Component> {
    try {
      const { componentId, isFavorite } = favoriteComponentDto;

      const componentData = {
        isFavorite,
        updatedAt: new Date(),
      } as Partial<Component>;

      const [component] = await this.database
        .update(components)
        .set(componentData)
        .where(
          and(eq(components.id, componentId), eq(components.userId, user.id)),
        )
        .returning();

      if (!component) {
        throw new RpcException('Component not found');
      }

      return {
        $type: 'api.components.Component',
        id: component.id,
        title: component.title,
        code: component.code,
        e2eTests: component.e2eTests ?? '',
        unitTests: component.unitTests ?? '',
        mdxDocs: component.mdxDocs ?? '',
        tsDocs: component.tsDocs ?? '',
        projectId: component.projectId,
        createdAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: component.createdAt.getTime(),
          nanos: component.createdAt.getMilliseconds(),
        },
        updatedAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: component.updatedAt.getTime(),
          nanos: component.updatedAt.getMilliseconds(),
        },
        projectName: '',
        userId: component.userId,
        wasE2eTested: Boolean(component.e2eTests),
        wasUnitTested: Boolean(component.unitTests),
        hasMdxDocs: Boolean(component.mdxDocs),
        hasTypescriptDocs: Boolean(component.tsDocs),
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  private enhancePrompt(prompt: string): string {
    return singleGeneratedPrompts.generateComponent(prompt).trim();
  }

  public async generateComponentStream(
    prompt: string,
    res: Response,
  ): Promise<void> {
    const enhancedPrompt = this.enhancePrompt(prompt);
    pipeDataStreamToResponse(res, {
      execute: async (dataStreamWriter) => {
        dataStreamWriter.writeData('initialized call');

        const result = streamText({
          model: GET_GEMINI_MODEL(),
          prompt: enhancedPrompt,
        });

        result.mergeIntoDataStream(dataStreamWriter);
      },
      onError: (error) => {
        // Error messages are masked by default for security reasons.
        // If you want to expose the error message to the client, you can do so here:
        return error instanceof Error ? error.message : String(error);
      },
    });
  }

  public async updateComponentCode(
    user: User,
    componentId: number,
    codeType: CodeType,
    updateComponentCodeDto: UpdateComponentCodeDto,
  ): Promise<ComponentsProto.Component> {
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
        throw new RpcException(
          `Component with ID ${String(componentId)} not found`,
        );
      }

      return {
        $type: 'api.components.Component',
        id: updatedComponent.id,
        title: updatedComponent.title,
        code: updatedComponent.code,
        e2eTests: updatedComponent.e2eTests ?? '',
        unitTests: updatedComponent.unitTests ?? '',
        mdxDocs: updatedComponent.mdxDocs ?? '',
        tsDocs: updatedComponent.tsDocs ?? '',
        projectId: updatedComponent.projectId,
        createdAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: updatedComponent.createdAt.getTime(),
          nanos: updatedComponent.createdAt.getMilliseconds(),
        },
        updatedAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: updatedComponent.updatedAt.getTime(),
          nanos: updatedComponent.updatedAt.getMilliseconds(),
        },
        projectName: '',
        userId: updatedComponent.userId,
        wasE2eTested: Boolean(updatedComponent.e2eTests),
        wasUnitTested: Boolean(updatedComponent.unitTests),
        hasMdxDocs: Boolean(updatedComponent.mdxDocs),
        hasTypescriptDocs: Boolean(updatedComponent.tsDocs),
      };
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
        throw new RpcException(`Invalid code type: ${String(codeType)}`);
    }
  }

  public async generateCodeFunction(
    user: User,
    body: GenerateCodeDto,
  ): Promise<ComponentsProto.Component> {
    try {
      const { componentId, codeType } = body;

      const [component] = await this.database
        .select()
        .from(components)
        .where(
          and(eq(components.id, componentId), eq(components.userId, user.id)),
        );

      if (!component) {
        throw new RpcException('Component not found');
      }

      const generatedCode = await this.generateCode(
        codeType as unknown as CodeType,
        component.code,
      );

      return {
        $type: 'api.components.Component',
        id: component.id,
        title: component.title,
        code: generatedCode,
        e2eTests: component.e2eTests ?? '',
        unitTests: component.unitTests ?? '',
        mdxDocs: component.mdxDocs ?? '',
        tsDocs: component.tsDocs ?? '',
        projectId: component.projectId,
        createdAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: component.createdAt.getTime(),
          nanos: component.createdAt.getMilliseconds(),
        },
        updatedAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: component.updatedAt.getTime(),
          nanos: component.updatedAt.getMilliseconds(),
        },
        projectName: '',
        userId: component.userId,
        wasE2eTested: Boolean(component.e2eTests),
        wasUnitTested: Boolean(component.unitTests),
        hasMdxDocs: Boolean(component.mdxDocs),
        hasTypescriptDocs: Boolean(component.tsDocs),
      };
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

    const prompt = singleGeneratedPrompts[codeType](sourceCode);
    if (!prompt) {
      throw new RpcException(`No prompt defined for code type: ${codeType}`);
    }

    try {
      const { text } = await generateText({
        model: GET_GEMINI_MODEL(),
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
