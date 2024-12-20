import {
  All,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CurrentUser,
  FavoriteComponentDto,
  GenerateCodeDto,
  JwtAuthGuard,
  SaveComponentDto,
  UpdateComponentCodeDto,
  type User,
} from '@app/common';
import { type CodeType, codeTypeValues } from '@repo/types';
import { Throttle } from '@nestjs/throttler';
import { rateLimitConfigs } from '../config/rate-limit.config';
import { type Request, type Response } from 'express';
import HttpProxy from 'http-proxy';
import { ClientRequest, IncomingMessage } from 'node:http';

@Controller('components')
@UseGuards(JwtAuthGuard)
export class ComponentsController {
  private proxy: HttpProxy;
  constructor(
    @Inject('COMPONENTS_SERVICE')
    private readonly componentsClient: ClientProxy,
  ) {
    this.proxy = HttpProxy.createProxyServer();

    // Correctly typed event handler
    this.proxy.on(
      'proxyReq',
      function (proxyReq: ClientRequest, req: IncomingMessage) {
        const originalReq = req as Request;

        // Make sure to forward the authorization header
        const authHeader = originalReq.headers['authorization'];
        if (authHeader) {
          proxyReq.setHeader('Authorization', authHeader);
        }

        // If the request has a body, we need to restream it
        if (originalReq.body) {
          const bodyData = JSON.stringify(originalReq.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
    );
  }

  @Get('/:projectId/:componentId')
  async getComponent(
    @CurrentUser() user: User,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('componentId', ParseIntPipe) componentId: number,
  ) {
    return firstValueFrom(
      this.componentsClient.send('components.get', {
        user,
        projectId,
        componentId,
      }),
    );
  }

  @Post()
  async saveComponent(
    @CurrentUser() user: User,
    @Body() saveComponentDto: SaveComponentDto,
  ) {
    console.log('saveComponentDto:', saveComponentDto);
    return firstValueFrom(
      this.componentsClient.send('components.save', { user, saveComponentDto }),
    );
  }

  @Post('/favorite')
  async favoriteComponent(
    @CurrentUser() user: User,
    @Body() favoriteComponentDto: FavoriteComponentDto,
  ) {
    return firstValueFrom(
      this.componentsClient.send('components.favorite', {
        user,
        favoriteComponentDto,
      }),
    );
  }

  // This is a proxy endpoint because of the streaming response.
  @All('generate')
  async proxyRequest(@Req() req: Request, @Res() res: Response) {
    return new Promise((resolve, reject) => {
      this.proxy.web(
        req,
        res,
        {
          target: `http://${process.env.COMPONENTS_SERVICE_HOST || 'localhost'}:${process.env.COMPONENTS_SERVICE_HTTP_PORT || '3348'}`,
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
    @CurrentUser() user: User,
    @Param('componentId', ParseIntPipe) componentId: number,
    @Param('codeType', new ParseEnumPipe(codeTypeValues)) codeType: CodeType,
    @Body() updateComponentCodeDto: UpdateComponentCodeDto,
  ) {
    return firstValueFrom(
      this.componentsClient.send('components.update-code', {
        user,
        componentId,
        codeType,
        updateComponentCodeDto,
      }),
    );
  }

  @Post('/generate-code')
  // Override default configuration for Rate limiting and duration.
  @Throttle({ ai: rateLimitConfigs.ai })
  async generateCodeBasedOnType(
    @CurrentUser() user: User,
    @Body() generateCodeDto: GenerateCodeDto,
  ) {
    return firstValueFrom(
      this.componentsClient.send('components.generate-code', {
        user,
        generateCodeDto,
      }),
    );
  }
}
