import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ComponentsService } from './components.service';
import {
  FavoriteComponentDto,
  GenerateCodeDto,
  GenerateComponentRequestDto,
  SaveComponentDto,
  UpdateComponentCodeDto,
  User,
} from '@app/common';
import { CodeType } from '@repo/types';
import { type Response } from 'express';
import { GrpcMethod } from '@nestjs/microservices';
// import { Observable } from 'rxjs';
// import { Metadata, ServerDuplexStream } from '@grpc/grpc-js';

@Controller()
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @GrpcMethod('ComponentsService', 'GetComponent')
  async getComponent(data: {
    user: User;
    projectId: number;
    componentId: number;
  }) {
    return this.componentsService.getSingleComponent(
      data.user,
      data.projectId,
      data.componentId,
    );
  }

  @GrpcMethod('ComponentsService', 'SaveComponent')
  async saveComponent(data: {
    user: User;
    saveComponentDto: SaveComponentDto;
  }) {
    return this.componentsService.saveComponent(
      data.user,
      data.saveComponentDto,
    );
  }

  @GrpcMethod('ComponentsService', 'FavoriteComponent')
  async favoriteComponent(data: {
    user: User;
    favoriteComponentDto: FavoriteComponentDto;
  }) {
    return this.componentsService.favoriteComponent(
      data.user,
      data.favoriteComponentDto,
    );
  }

  @GrpcMethod('ComponentsService', 'UpdateComponentCode')
  async updateComponentCode(data: {
    user: User;
    componentId: number;
    codeType: CodeType;
    updateComponentCodeDto: UpdateComponentCodeDto;
  }) {
    return this.componentsService.updateComponentCode(
      data.user,
      data.componentId,
      data.codeType,
      data.updateComponentCodeDto,
    );
  }

  @GrpcMethod('ComponentsService', 'GenerateCode')
  async generateCodeBasedOnType(data: {
    user: User;
    generateCodeDto: GenerateCodeDto;
  }) {
    return this.componentsService.generateCodeFunction(
      data.user,
      data.generateCodeDto,
    );
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

  // HTTP Endpoint for generating components (Stream)
  @Post('api/components/generate')
  async generateComponent(
    @Req() req: Request,
    @Body() body: GenerateComponentRequestDto,
    @Res() res: Response,
  ) {
    try {
      const prompt = body.messages[body.messages.length - 1].content;
      return this.componentsService.generateComponentStream(prompt, res);
    } catch (error) {
      console.error('Error in Components Service:', error);
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      res.status(500).json({ error: errorMessage });
    }
  }
}
