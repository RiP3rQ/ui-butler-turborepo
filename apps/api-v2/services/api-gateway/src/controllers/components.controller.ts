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
import { firstValueFrom } from 'rxjs';
import {
  CurrentUser,
  FavoriteComponentDto,
  GenerateCodeDto,
  JwtAuthGuard,
  SaveComponentDto,
  UpdateComponentCodeDto,
} from '@app/common';
import { codeTypeValues } from '@repo/types';
import { Throttle } from '@nestjs/throttler';
import { rateLimitConfigs } from '../config/rate-limit.config';
import { type Request, type Response } from 'express';
import HttpProxy from 'http-proxy';
import { ClientRequest, IncomingMessage } from 'node:http';
import { ComponentsProto } from '@app/proto';
import { handleGrpcError } from '../utils/grpc-error.util';

@Controller('components')
@UseGuards(JwtAuthGuard)
export class ComponentsController implements OnModuleInit {
  private componentsService: ComponentsProto.ComponentsServiceClient;
  private proxy: HttpProxy;

  constructor(
    @Inject('COMPONENTS_SERVICE')
    private readonly client: ClientGrpc,
  ) {
    this.proxy = HttpProxy.createProxyServer();

    this.proxy.on(
      'proxyReq',
      function (proxyReq: ClientRequest, req: IncomingMessage) {
        const originalReq = req as Request;
        const authHeader = originalReq.headers['authorization'];
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

  onModuleInit() {
    this.componentsService =
      this.client.getService<ComponentsProto.ComponentsServiceClient>(
        'ComponentsService',
      );
  }

  @Get('/:projectId/:componentId')
  async getComponent(
    @CurrentUser() user: ComponentsProto.User,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('componentId', ParseIntPipe) componentId: number,
  ) {
    if (!user) {
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
        projectId,
        componentId,
      };

      return await firstValueFrom(this.componentsService.getComponent(request));
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Post()
  async saveComponent(
    @CurrentUser() user: ComponentsProto.User,
    @Body() saveComponentDto: SaveComponentDto,
  ) {
    if (!user) {
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

      return await firstValueFrom(
        this.componentsService.saveComponent(request),
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Post('/favorite')
  async favoriteComponent(
    @CurrentUser() user: ComponentsProto.User,
    @Body() favoriteComponentDto: FavoriteComponentDto,
  ) {
    if (!user) {
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

      return await firstValueFrom(
        this.componentsService.favoriteComponent(request),
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @All('generate')
  async proxyRequest(@Req() req: Request, @Res() res: Response) {
    return new Promise((resolve, reject) => {
      this.proxy.web(
        req,
        res,
        {
          target: `http://${process.env.COMPONENTS_SERVICE_HOST || 'localhost'}:${
            process.env.COMPONENTS_SERVICE_HTTP_PORT || '3348'
          }`,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        (err) => {
          if (err) {
            console.error('Proxy error:', err);
            res.status(500).json({ error: 'Proxy error: ' + err.message });
            reject(err);
          }
        },
      );

      this.proxy.on('error', (err) => {
        console.error('Proxy error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Proxy error: ' + err.message });
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
  async updateComponentCode(
    @CurrentUser() user: ComponentsProto.User,
    @Param('componentId', ParseIntPipe) componentId: number,
    @Param('codeType', new ParseEnumPipe(codeTypeValues))
    codeType: ComponentsProto.CodeType,
    @Body() updateComponentCodeDto: UpdateComponentCodeDto,
  ) {
    if (!user) {
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

      return await firstValueFrom(
        this.componentsService.updateComponentCode(request),
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Post('/generate-code')
  @Throttle({ ai: rateLimitConfigs.ai })
  async generateCodeBasedOnType(
    @CurrentUser() user: ComponentsProto.User,
    @Body() generateCodeDto: GenerateCodeDto,
  ) {
    if (!user) {
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

      return await firstValueFrom(this.componentsService.generateCode(request));
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
