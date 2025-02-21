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
import {
  All,
  Body,
  Controller,
  Get,
  Inject,
  Logger,
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { codeTypeValues } from '@shared/types';
import { type Request, type Response } from 'express';
import HttpProxy from 'http-proxy';
import type { ClientGrpc } from '@nestjs/microservices';
// import { rateLimitConfigs } from '../config/rate-limit.config';
import { RateLimit } from '../throttling/rate-limit.decorator';
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';
import { handleGrpcError } from '../utils/grpc-error.util';
import { ThrottleGuard } from '../throttling/throttle.guard';
import { randomUUID } from 'node:crypto';

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
  private readonly logger = new Logger(ComponentsController.name);

  constructor(
    @Inject('COMPONENTS_SERVICE')
    private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
  ) {
    this.proxy = HttpProxy.createProxyServer({
      // Streaming-specific proxy options
      timeout: 600000, // 10 minutes
      proxyTimeout: 600000,
      ws: true,
    });
    this.setupProxyEventHandlers();
  }

  private setupProxyEventHandlers(): void {
    this.proxy.on(
      'proxyReq',
      (proxyReq: ClientRequest, req: IncomingMessage) => {
        const originalReq = req as Request;
        const requestId = randomUUID();

        // Set streaming-specific headers
        proxyReq.setHeader('X-Request-ID', requestId); // Request ID for tracing
        proxyReq.setHeader('Connection', 'keep-alive'); // Server-Sent Events
        proxyReq.setHeader('Cache-Control', 'no-cache'); // Server-Sent Events
        proxyReq.setHeader('Content-Type', 'text/event-stream'); // Server-Sent Events
        proxyReq.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

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

        this.logger.debug(`Streaming request initiated: ${requestId}`);
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
    const target = `http://${process.env.COMPONENTS_SERVICE_HOST ?? 'localhost'}:${
      process.env.COMPONENTS_SERVICE_HTTP_PORT ?? '3348'
    }`;

    return new Promise((resolve, reject) => {
      const streamStart = Date.now();

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

      this.proxy.on('end', () => {
        const streamEnd = Date.now();
        console.log(
          `Streaming request completed in ${streamEnd - streamStart}ms`,
        );
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
  @UseGuards(ThrottleGuard)
  @RateLimit({
    ttl: 60,
    limit: 10,
    errorMessage: 'Too many generate code requests. Try again in 1 minute.',
  })
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
        codeType: generateCodeDto.toProto().codeType,
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
