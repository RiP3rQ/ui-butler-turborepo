import {
  dateToTimestamp,
  GET_GEMINI_MODEL,
  SaveComponentDto,
  UpdateComponentCodeDto,
  User,
} from '@microservices/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  and,
  Component,
  components,
  DATABASE_CONNECTION,
  type DrizzleDatabase,
  eq,
  NewComponent,
  projects,
} from '@microservices/database';
import { ComponentsProto } from '@microservices/proto';
import { RpcException } from '@nestjs/microservices';
import { singleGeneratedPrompts } from '@shared/prompts';
import { CodeType, protoCodeTypeToEnumMap } from '@shared/types';
import { generateText, pipeDataStreamToResponse, streamText } from 'ai';
import { type Response } from 'express';

@Injectable()
export class ComponentsService {
  private readonly logger = new Logger(ComponentsService.name);

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
          isFavorite: components.isFavorite,
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
        console.error('Component not found');
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
        isFavorite: component.isFavorite ?? false,
        createdAt: dateToTimestamp(component.createdAt),
        updatedAt: dateToTimestamp(component.updatedAt),
        projectName: component.projectName,
        userId: component.userId,
        wasE2eTested: Boolean(component.e2eTests),
        wasUnitTested: Boolean(component.unitTests),
        hasMdxDocs: Boolean(component.mdxDocs),
        hasTypescriptDocs: Boolean(component.tsDocs),
      };
    } catch (error) {
      console.error('Error in getSingleComponent:', error);
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
        console.error('Failed to create component');
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
        isFavorite: newComponent.isFavorite ?? false,
        createdAt: dateToTimestamp(newComponent.createdAt),
        updatedAt: dateToTimestamp(newComponent.updatedAt),
        projectName: '',
        userId: newComponent.userId,
        wasE2eTested: false,
        wasUnitTested: false,
        hasMdxDocs: false,
        hasTypescriptDocs: false,
      };
    } catch (error) {
      console.error('Error in saveComponent:', error);
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
        console.error('Component not found');
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
        isFavorite: component.isFavorite ?? false,
        createdAt: dateToTimestamp(component.createdAt),
        updatedAt: dateToTimestamp(component.updatedAt),
        projectName: '',
        userId: component.userId,
        wasE2eTested: Boolean(component.e2eTests),
        wasUnitTested: Boolean(component.unitTests),
        hasMdxDocs: Boolean(component.mdxDocs),
        hasTypescriptDocs: Boolean(component.tsDocs),
      };
    } catch (error) {
      console.error('Error in favoriteComponent:', error);
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
    // STREAMING HANDLER
    pipeDataStreamToResponse(res, {
      execute: async (dataStreamWriter) => {
        dataStreamWriter.writeData('stream_started');

        const result = streamText({
          model: GET_GEMINI_MODEL(),
          prompt: enhancedPrompt,
          maxTokens: 4096,
        });
        // WRITE STREAM DATA
        result.mergeIntoDataStream(dataStreamWriter);
      },
      onError: (error) => {
        this.logger.error('Stream processing error:', error);
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
        console.error('Component not found');
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
        isFavorite: updatedComponent.isFavorite ?? false,
        createdAt: dateToTimestamp(updatedComponent.createdAt),
        updatedAt: dateToTimestamp(updatedComponent.updatedAt),
        projectName: '',
        userId: updatedComponent.userId,
        wasE2eTested: Boolean(updatedComponent.e2eTests),
        wasUnitTested: Boolean(updatedComponent.unitTests),
        hasMdxDocs: Boolean(updatedComponent.mdxDocs),
        hasTypescriptDocs: Boolean(updatedComponent.tsDocs),
      };
    } catch (error) {
      console.error('Error in updateComponentCode:', error);
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
        console.error(`Invalid code type: ${String(codeType)}`);
        throw new RpcException(`Invalid code type: ${String(codeType)}`);
    }
  }

  public async generateCodeFunction(
    user: User,
    body: { componentId: number; codeType: ComponentsProto.CodeType },
  ): Promise<ComponentsProto.Component> {
    try {
      const [component] = await this.database
        .select()
        .from(components)
        .where(
          and(
            eq(components.id, body.componentId),
            eq(components.userId, user.id),
          ),
        );

      if (!component) {
        console.error('Component not found');
        throw new RpcException('Component not found');
      }

      const generatedCode = await this.generateCode(
        body.codeType,
        component.code,
      );

      // Map the gRPC CodeType to the CodeType enum
      const codeTypeEnum = protoCodeTypeToEnumMap[body.codeType];

      if (!codeTypeEnum) {
        console.error(`Invalid code type: ${String(body.codeType)}`);
        throw new RpcException(`Invalid code type: ${String(body.codeType)}`);
      }

      const updatedData = {
        [codeTypeEnum]: generatedCode,
        updatedAt: new Date(),
      };

      // Update the component with the generated code
      const [updatedComponent] = await this.database
        .update(components)
        .set(updatedData)
        .where(eq(components.id, body.componentId))
        .returning();

      if (!updatedComponent) {
        console.error('Failed to update component');
        throw new RpcException(
          `Failed to update component with ID ${String(body.componentId)}`,
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
        isFavorite: updatedComponent.isFavorite ?? false,
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
      console.error('Error in generateCodeFunction:', error);
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  private async generateCode(
    codeType: ComponentsProto.CodeType,
    sourceCode: string,
  ): Promise<string> {
    if (codeType === ComponentsProto.CodeType.CODE) {
      return sourceCode;
    }

    // Map the gRPC CodeType to the CodeType enum
    const codeTypeEnum = protoCodeTypeToEnumMap[codeType];
    if (!codeTypeEnum || !(codeTypeEnum in singleGeneratedPrompts)) {
      return sourceCode;
    }

    const promptFn =
      singleGeneratedPrompts[
        codeTypeEnum as keyof typeof singleGeneratedPrompts
      ];
    const prompt = promptFn(sourceCode);

    if (!prompt) {
      console.error(`No prompt defined for code type: ${codeTypeEnum}`);
      throw new RpcException(
        `No prompt defined for code type: ${codeTypeEnum}`,
      );
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
      console.error(
        `Error generating code for ${String(protoCodeTypeToEnumMap[codeType])}:`,
        error,
      );
      throw new RpcException(
        `Failed to generate ${String(protoCodeTypeToEnumMap[codeType])}`,
      );
    }
  }
}
