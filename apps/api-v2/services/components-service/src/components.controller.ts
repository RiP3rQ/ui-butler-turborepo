import { GenerateComponentRequestDto } from '@microservices/common';
import { ComponentsProto } from '@microservices/proto';
import { Body, Controller, Logger, Post, Res } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CodeType } from '@shared/types';
import { type Response } from 'express';
import { ComponentsService } from './components.service';
// import { Observable } from 'rxjs';
// import { Metadata, ServerDuplexStream } from '@grpc/grpc-js';

@Controller()
export class ComponentsController {
  private readonly logger = new Logger(ComponentsController.name);

  constructor(private readonly componentsService: ComponentsService) {}

  @GrpcMethod('ComponentsService', 'GetComponent')
  public async getComponent(
    request: ComponentsProto.GetComponentRequest,
  ): Promise<ComponentsProto.Component> {
    if (!request.user) {
      console.error('User is required');
      throw new RpcException('User is required');
    }

    console.log('request', request);

    this.logger.debug(
      `GetComponent request received for user ${String(request.user.email)} and component ${String(request.componentId)}`,
    );

    return this.componentsService.getSingleComponent(
      request.user,
      request.projectId,
      request.componentId,
    );
  }

  @GrpcMethod('ComponentsService', 'SaveComponent')
  public async saveComponent(
    request: ComponentsProto.SaveComponentRequest,
  ): Promise<ComponentsProto.Component> {
    console.log('request', request);
    if (!request.user) {
      console.error('User is required');
      throw new RpcException('User is required');
    }

    if (!request.title) {
      console.error('Title is required');
      throw new RpcException('Title is required');
    }

    if (!request.projectId) {
      console.error('Project ID is required');
      throw new RpcException('Project ID is required');
    }

    if (!request.code) {
      console.error('Code is required');
      throw new RpcException('Code is required');
    }

    this.logger.debug(
      `SaveComponent request received for user ${String(request.user.id)} and component ${String(request.title)}`,
    );
    return this.componentsService.saveComponent(request.user, {
      title: request.title,
      projectId: Number(request.projectId),
      code: request.code,
    });
  }

  @GrpcMethod('ComponentsService', 'FavoriteComponent')
  public async favoriteComponent(
    request: ComponentsProto.FavoriteComponentRequest,
  ): Promise<ComponentsProto.Component> {
    console.log('request', request);
    if (!request.user) {
      console.error('User is required');
      throw new RpcException('User is required');
    }

    if (!request.componentId) {
      console.error('Component ID is required');
      throw new RpcException('Component ID is required');
    }

    if (typeof request.favoriteValue !== 'boolean') {
      console.error('Favorite value is required');
      throw new RpcException('Favorite value is required');
    }

    this.logger.debug(
      `FavoriteComponent request received for user ${String(request.user.id)} and component ${String(request.componentId)}`,
    );

    return this.componentsService.favoriteComponent(request.user, {
      componentId: request.componentId,
      isFavorite: request.favoriteValue,
    });
  }

  @GrpcMethod('ComponentsService', 'UpdateComponentCode')
  public async updateComponentCode(
    request: ComponentsProto.UpdateCodeRequest,
  ): Promise<ComponentsProto.Component> {
    if (!request.user) {
      console.error('User is required');
      throw new RpcException('User is required');
    }

    if (!request.componentId) {
      console.error('Component ID is required');
      throw new RpcException('Component ID is required');
    }

    if (!request.codeType) {
      console.error('Code type is required');
      throw new RpcException('Code type is required');
    }

    this.logger.debug(
      `UpdateComponentCode request received for user ${String(request.user.id)} and component ${String(request.componentId)}`,
    );

    return this.componentsService.updateComponentCode(
      request.user,
      request.componentId,
      request.codeType as unknown as CodeType,
      {
        content: request.content,
      },
    );
  }

  @GrpcMethod('ComponentsService', 'GenerateCode')
  public async generateCodeBasedOnType(
    request: ComponentsProto.GenerateCodeRequest,
  ): Promise<ComponentsProto.Component> {
    if (!request.user) {
      console.error('User is required');
      throw new RpcException('User is required');
    }

    if (!request.codeType) {
      console.error('Code type is required');
      throw new RpcException('Code type is required');
    }

    this.logger.debug(
      `GenerateCodeBasedOnType request received for user ${String(request.user.id)} and type ${String(request.codeType)}`,
    );

    console.log('request', request);

    return this.componentsService.generateCodeFunction(request.user, {
      codeType: request.codeType,
      componentId: request.componentId,
    });
  }

  // HTTP Endpoint for generating components (Stream)
  @Post('api/components/generate')
  public async generateComponent(
    @Body() body: GenerateComponentRequestDto,
    @Res() res: Response,
  ) {
    try {
      const prompt = body.messages[body.messages.length - 1]?.content;

      if (!prompt) {
        console.error('Prompt is required');
        throw new Error('Prompt is required');
      }

      this.logger.debug(
        `GenerateComponent request received for prompt ${String(prompt)}`,
      );
      return this.componentsService.generateComponentStream(prompt, res);
    } catch (error) {
      console.error('Error in Components Service:', error);
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      res.status(500).json({ error: errorMessage });
    }
  }

  // CAN ALSO BE IMPLEMENTED AS A STREAM METHOD
  // @GrpcStreamMethod('ComponentsService', 'GenerateComponentStream')
  // async generateComponentStream(
  //   data: { prompt: string },
  //   metadata: Metadata,
  //   call: ServerDuplexStream<any, any>,
  // ): Promise<Observable<any>> {
  //   return new Observable((subscriber) => {
  //     this.componentsService
  //       .generateComponentStream(data.prompt, {
  //         write: (chunk) => subscriber.next({ content: chunk }),
  //         end: () => subscriber.complete(),
  //       })
  //       .catch((error) => subscriber.error(error));
  //   });
  // }
}
