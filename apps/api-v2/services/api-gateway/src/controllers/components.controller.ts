import { ClientRequest, IncomingMessage } from 'node:http';
import {
  All,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  OnModuleInit,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  CurrentUser,
  FavoriteComponentDto,
  GenerateCodeDto,
  JwtAuthGuard,
  SaveComponentDto,
  UpdateComponentCodeDto,
} from '@app/common';
import { codeTypeValues } from '@repo/types';
import { type Request, type Response } from 'express';
import HttpProxy from 'http-proxy';
import { Throttle } from '@nestjs/throttler';
import { ComponentsProto } from '@app/proto';
import { rateLimitConfigs } from '../config/rate-limit.config';
import { handleGrpcError } from '../utils/grpc-error.util';
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';

@Controller('components')
@UseGuards(JwtAuthGuard)
export class ComponentsController implements OnModuleInit {
  private componentsService: ComponentsProto.ComponentsServiceClient;
  private proxy: HttpProxy;

  constructor(
    @Inject('COMPONENTS_SERVICE')
    private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
  ) {
    this.proxy = HttpProxy.createProxyServer();

    this.proxy.on(
      'proxyReq',
      (proxyReq: ClientRequest, req: IncomingMessage) => {
        const originalReq = req as Request;
        const authHeader = originalReq.headers.authorization;
        if (authHeader) {
          proxyReq.setHeader('Authorization', authHeader);
        }

        if (originalReq.body) {
          const bodyData = JSON.stringify(originalReq.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
    );
  }

  public onModuleInit(): void {
    this.componentsService =
      this.client.getService<ComponentsProto.ComponentsServiceClient>(
        'ComponentsService',
      );
  }

  @Get('/:projectId/:componentId')
  public async getComponent(
    @CurrentUser() user: ComponentsProto.User,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('componentId', ParseIntPipe) componentId: number,
  ): Promise<ComponentsProto.Component> {
    if (typeof user === 'undefined') {
      throw new NotFoundException('Unauthorized');
    }

    try {
      const request: ComponentsProto.GetComponentRequest = {
        $type: 'api.components.GetComponentRequest',
        user: {
          $type: 'api.components.User',
          id: user.id,
          email: user.email,
        },
        projectId: Number(projectId),
        componentId: Number(componentId),
      };

      return await this.grpcClient.call(
        this.componentsService.getComponent(request),
        'Components.getComponent',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Post()
  public async saveComponent(
    @CurrentUser() user: ComponentsProto.User,
    @Body() saveComponentDto: SaveComponentDto,
  ): Promise<ComponentsProto.Component> {
    if (typeof user === 'undefined') {
      throw new NotFoundException('Unauthorized');
    }

    try {
      const request: ComponentsProto.SaveComponentRequest = {
        $type: 'api.components.SaveComponentRequest',
        user: {
          $type: 'api.components.User',
          id: user.id,
          email: user.email,
        },
        title: saveComponentDto.title,
        code: saveComponentDto.code,
        projectId: Number(saveComponentDto.projectId),
      };

      console.log('request', request);

      return await this.grpcClient.call(
        this.componentsService.saveComponent(request),
        'Components.saveComponent',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Post('/favorite')
  public async favoriteComponent(
    @CurrentUser() user: ComponentsProto.User,
    @Body() favoriteComponentDto: FavoriteComponentDto,
  ): Promise<ComponentsProto.Component> {
    if (typeof user === 'undefined') {
      throw new NotFoundException('Unauthorized');
    }

    try {
      const request: ComponentsProto.FavoriteComponentRequest = {
        $type: 'api.components.FavoriteComponentRequest',
        user: {
          $type: 'api.components.User',
          id: user.id,
          email: user.email,
        },
        projectId: favoriteComponentDto.projectId,
        componentId: favoriteComponentDto.componentId,
        favoriteValue: favoriteComponentDto.favoriteValue,
      };

      return await this.grpcClient.call(
        this.componentsService.favoriteComponent(request),
        'Components.favoriteComponent',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @All('generate')
  public async proxyRequest(@Req() req: Request, @Res() res: Response) {
    return new Promise((resolve, reject) => {
      this.proxy.web(
        req,
        res,
        {
          target: `http://${process.env.COMPONENTS_SERVICE_HOST ?? 'localhost'}:${
            process.env.COMPONENTS_SERVICE_HTTP_PORT ?? '3348'
          }`,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        (err: Error | null) => {
          if (err) {
            console.error('Proxy error:', err);
            res.status(500).json({ error: `Proxy error: ${err.message}` });
            reject(err);
          }
        },
      );

      this.proxy.on('error', (err) => {
        console.error('Proxy error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: `Proxy error: ${err.message}` });
        }
        reject(err);
      });

      this.proxy.on('proxyRes', (proxyRes: IncomingMessage) => {
        console.log('Received response from Components Service');
        console.log('Status:', proxyRes.statusCode);
        if (proxyRes.statusCode === 200) {
          resolve(true);
        }
      });
    });
  }

  @Patch('/:componentId/:codeType')
  public async updateComponentCode(
    @CurrentUser() user: ComponentsProto.User,
    @Param('componentId', ParseIntPipe) componentId: number,
    @Param('codeType', new ParseEnumPipe(codeTypeValues))
    codeType: ComponentsProto.CodeType,
    @Body() updateComponentCodeDto: UpdateComponentCodeDto,
  ): Promise<ComponentsProto.Component> {
    if (typeof user === 'undefined') {
      throw new NotFoundException('Unauthorized');
    }

    try {
      const request: ComponentsProto.UpdateCodeRequest = {
        $type: 'api.components.UpdateCodeRequest',
        user: {
          $type: 'api.components.User',
          id: user.id,
          email: user.email,
        },
        componentId,
        codeType,
        content: updateComponentCodeDto.content,
      };

      return await this.grpcClient.call(
        this.componentsService.updateComponentCode(request),
        'Components.updateComponentCode',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Throttle({ ai: rateLimitConfigs.ai })
  @Post('/generate-code')
  public async generateCodeBasedOnType(
    @CurrentUser() user: ComponentsProto.User,
    @Body() generateCodeDto: GenerateCodeDto,
  ): Promise<ComponentsProto.Component> {
    if (typeof user === 'undefined') {
      throw new NotFoundException('Unauthorized');
    }

    try {
      const request: ComponentsProto.GenerateCodeRequest = {
        $type: 'api.components.GenerateCodeRequest',
        user: {
          $type: 'api.components.User',
          id: user.id,
          email: user.email,
        },
        componentId: generateCodeDto.componentId,
        codeType: generateCodeDto.codeType,
      };

      return await this.grpcClient.call(
        this.componentsService.generateCode(request),
        'Components.generateCode',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
