import { ClientRequest, IncomingMessage } from 'node:http';
import {
  CurrentUser,
  FavoriteComponentDto,
  GenerateCodeDto,
  JwtAuthGuard,
  SaveComponentDto,
  UpdateComponentCodeDto,
} from '@microservices/common';
import { ComponentsProto } from '@microservices/proto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
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
  UseInterceptors,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { codeTypeValues } from '@shared/types';
import { type Request, type Response } from 'express';
import HttpProxy from 'http-proxy';
import { rateLimitConfigs } from '../config/rate-limit.config';
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';
import { handleGrpcError } from '../utils/grpc-error.util';

/**
 * Controller handling component-related operations through gRPC communication
 * with the components microservice.
 * @class ComponentsController
 */
@ApiTags('Components')
@ApiBearerAuth()
@Controller('components')
@UseGuards(JwtAuthGuard)
export class ComponentsController implements OnModuleInit {
  private componentsService: ComponentsProto.ComponentsServiceClient;
  private readonly proxy: HttpProxy;

  constructor(
    @Inject('COMPONENTS_SERVICE')
    private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
  ) {
    this.proxy = HttpProxy.createProxyServer();
    this.setupProxyEventHandlers();
  }

  private setupProxyEventHandlers(): void {
    this.proxy.on(
      'proxyReq',
      (proxyReq: ClientRequest, req: IncomingMessage) => {
        const originalReq = req as Request;
        if (originalReq.headers.authorization) {
          proxyReq.setHeader(
            'Authorization',
            originalReq.headers.authorization,
          );
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

  /**
   * Retrieves a specific component by ID
   * @param {ComponentsProto.User} user - The authenticated user
   * @param {number} projectId - Project identifier
   * @param {number} componentId - Component identifier
   * @returns {Promise<ComponentsProto.Component>} The requested component
   * @throws {NotFoundException} When user or component is not found
   */
  @ApiOperation({ summary: 'Get component by ID' })
  @ApiParam({ name: 'projectId', type: Number })
  @ApiParam({ name: 'componentId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Component retrieved successfully',
    type: 'ComponentsProto.Component',
  })
  @ApiResponse({ status: 404, description: 'Component not found' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // 5 minutes cache
  @Get('/:projectId/:componentId')
  public async getComponent(
    @CurrentUser() user: ComponentsProto.User,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('componentId', ParseIntPipe) componentId: number,
  ): Promise<ComponentsProto.Component> {
    if (!user.id) {
      throw new NotFoundException('Unauthorized: User not found');
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

      return await this.grpcClient.call(
        this.componentsService.getComponent(request),
        'Components.getComponent',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Saves a new component
   * @param {ComponentsProto.User} user - The authenticated user
   * @param {SaveComponentDto} saveComponentDto - Component data to save
   * @returns {Promise<ComponentsProto.Component>} The saved component
   */
  @ApiOperation({ summary: 'Save new component' })
  @ApiBody({ type: SaveComponentDto })
  @ApiResponse({
    status: 201,
    description: 'Component saved successfully',
    type: 'ComponentsProto.Component',
  })
  @Post()
  public async saveComponent(
    @CurrentUser() user: ComponentsProto.User,
    @Body() saveComponentDto: SaveComponentDto,
  ): Promise<ComponentsProto.Component> {
    if (!user.id) {
      throw new NotFoundException('Unauthorized: User not found');
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

  /**
   * Toggles favorite status for a component
   * @param {ComponentsProto.User} user - The authenticated user
   * @param {FavoriteComponentDto} favoriteComponentDto - Favorite toggle data
   * @returns {Promise<ComponentsProto.Component>} Updated component
   */
  @ApiOperation({ summary: 'Toggle component favorite status' })
  @ApiBody({ type: FavoriteComponentDto })
  @ApiResponse({
    status: 200,
    description: 'Component favorite status updated',
    type: 'ComponentsProto.Component',
  })
  @Post('/favorite')
  public async favoriteComponent(
    @CurrentUser() user: ComponentsProto.User,
    @Body() favoriteComponentDto: FavoriteComponentDto,
  ): Promise<ComponentsProto.Component> {
    if (!user.id) {
      throw new NotFoundException('Unauthorized: User not found');
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

  /**
   * Proxies generate request to components service
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   */
  @ApiOperation({ summary: 'Generate component code' })
  @ApiResponse({
    status: 200,
    description: 'Code generated successfully',
  })
  @All('generate')
  public async proxyRequest(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const target = `http://${process.env.COMPONENTS_SERVICE_HOST ?? 'localhost'}:${
        process.env.COMPONENTS_SERVICE_HTTP_PORT ?? '3348'
      }`;

      this.proxy.web(
        req,
        res,
        {
          target,
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
          resolve();
        }
      });
    });
  }

  /**
   * Updates component code of specified type
   * @param {ComponentsProto.User} user - The authenticated user
   * @param {number} componentId - Component identifier
   * @param {ComponentsProto.CodeType} codeType - Type of code to update
   * @param {UpdateComponentCodeDto} updateComponentCodeDto - New code content
   * @returns {Promise<ComponentsProto.Component>} Updated component
   */
  @ApiOperation({ summary: 'Update component code' })
  @ApiParam({ name: 'componentId', type: Number })
  @ApiParam({ name: 'codeType', enum: codeTypeValues })
  @ApiBody({ type: UpdateComponentCodeDto })
  @ApiResponse({
    status: 200,
    description: 'Component code updated successfully',
    type: 'ComponentsProto.Component',
  })
  @Patch('/:componentId/:codeType')
  public async updateComponentCode(
    @CurrentUser() user: ComponentsProto.User,
    @Param('componentId', ParseIntPipe) componentId: number,
    @Param('codeType', new ParseEnumPipe(codeTypeValues))
    codeType: ComponentsProto.CodeType,
    @Body() updateComponentCodeDto: UpdateComponentCodeDto,
  ): Promise<ComponentsProto.Component> {
    if (!user.id) {
      throw new NotFoundException('Unauthorized: User not found');
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

  /**
   * Generates code based on component type
   * @param {ComponentsProto.User} user - The authenticated user
   * @param {GenerateCodeDto} generateCodeDto - Code generation parameters
   * @returns {Promise<ComponentsProto.Component>} Component with generated code
   */
  @ApiOperation({ summary: 'Generate code for component' })
  @ApiBody({ type: GenerateCodeDto })
  @ApiResponse({
    status: 200,
    description: 'Code generated successfully',
    type: 'ComponentsProto.Component',
  })
  @Throttle({ ai: rateLimitConfigs.ai })
  @Post('/generate-code')
  public async generateCodeBasedOnType(
    @CurrentUser() user: ComponentsProto.User,
    @Body() generateCodeDto: GenerateCodeDto,
  ): Promise<ComponentsProto.Component> {
    if (!user.id) {
      throw new NotFoundException('Unauthorized: User not found');
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
