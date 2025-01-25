import {
  CreateWorkflowDto,
  CurrentUser,
  DuplicateWorkflowDto,
  JwtAuthGuard,
  PublishWorkflowDto,
  RunWorkflowDto,
  UpdateWorkflowDto,
  type User,
} from '@microservices/common';
import { WorkflowsProto } from '@microservices/proto';
import {
  CacheInterceptor,
  CacheTTL,
  CACHE_MANAGER,
} from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  SetMetadata,
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
import { type Cache } from 'cache-manager';
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';
import { handleGrpcError } from '../utils/grpc-error.util';
import {
  CustomCacheInterceptor,
  IGNORE_CACHE_KEY,
} from '../interceptors/custom-cache.interceptor';

const CACHE_TTL_1_MINUTE = 60000;
const CACHE_TTL_5_MINUTES = 300000;
const CACHE_KEY_PREFIX = 'workflows';

/**
 * Controller handling workflow-related operations through gRPC communication
 * with the workflows microservice.
 * @class WorkflowsController
 */
@ApiTags('Workflows')
@ApiBearerAuth()
@Controller('workflows')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CustomCacheInterceptor)
export class WorkflowsController implements OnModuleInit {
  private workflowsService: WorkflowsProto.WorkflowsServiceClient;

  constructor(
    @Inject('WORKFLOWS_SERVICE') private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly cacheInterceptor: CustomCacheInterceptor,
  ) {}

  public onModuleInit(): void {
    this.workflowsService =
      this.client.getService<WorkflowsProto.WorkflowsServiceClient>(
        'WorkflowsService',
      );
  }

  /**
   * Converts a User to WorkflowsProto.User
   * @private
   * @param {User} user - User to convert
   * @returns {WorkflowsProto.User} Converted user for proto messages
   * @throws {NotFoundException} When user is not found
   */
  private userToProtoUser(user: User): WorkflowsProto.User {
    if (!user.id) {
      throw new NotFoundException('Unauthorized: User not found');
    }

    return {
      $type: 'api.workflows.User',
      id: String(user.id),
      email: user.email,
    };
  }

  /**
   * Generates cache key for workflow data
   */
  private getCacheKey(userId: number, type: string, id?: number): string {
    return `${CACHE_KEY_PREFIX}:${type}:user:${String(userId)}${id ? `:workflow:${String(id)}` : ''}`;
  }

  /**
   * Invalidates all workflow-related caches for a user
   */
  private async invalidateUserCaches(userId: number): Promise<void> {
    const pattern = `${CACHE_KEY_PREFIX}:*:user:${String(userId)}*`;
    const keys = await this.cacheManager.store.keys(pattern);
    await Promise.all(keys.map((key) => this.cacheManager.del(key)));
  }

  /**
   * Retrieves all workflows for the authenticated user
   * @param {User} user - The authenticated user
   * @returns {Promise<WorkflowsProto.Workflow[]>} List of user's workflows
   */
  @ApiOperation({ summary: 'Get all user workflows' })
  @ApiResponse({
    status: 200,
    description: 'Workflows retrieved successfully',
    type: JSON.stringify(WorkflowsProto.Workflow),
    isArray: true,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @CacheTTL(CACHE_TTL_5_MINUTES)
  @Get()
  public async getAllUserWorkflows(
    @CurrentUser() user: User,
  ): Promise<WorkflowsProto.WorkflowsResponse> {
    const cacheKey = this.getCacheKey(user.id, 'list');
    const cachedData =
      await this.cacheManager.get<WorkflowsProto.WorkflowsResponse>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await this.grpcClient.call(
        this.workflowsService.getAllUserWorkflows({
          $type: 'api.workflows.GetAllUserWorkflowsRequest',
          user: this.userToProtoUser(user),
        }),
        'WorkflowsController.getAllUserWorkflows',
      );
      await this.cacheManager.set(cacheKey, response, CACHE_TTL_5_MINUTES);
      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Retrieves a specific workflow by ID
   * @param {User} user - The authenticated user
   * @param {number} workflowId - Workflow identifier
   * @returns {Promise<WorkflowsProto.Workflow>} The requested workflow
   */
  @ApiOperation({ summary: 'Get workflow by ID' })
  @ApiParam({ name: 'workflowId', type: Number, description: 'Workflow ID' })
  @ApiResponse({
    status: 200,
    description: 'Workflow retrieved successfully',
    type: JSON.stringify(WorkflowsProto.Workflow),
  })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CACHE_TTL_1_MINUTE)
  @Get('get-by-id/:workflowId')
  public async getWorkflowById(
    @CurrentUser() user: User,
    @Param('workflowId', ParseIntPipe) workflowId: number,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    const cacheKey = this.getCacheKey(user.id, 'detail', workflowId);
    const cachedData =
      await this.cacheManager.get<WorkflowsProto.WorkflowResponse>(cacheKey);

    console.log('cacheKey', cacheKey);
    console.log('cachedData', cachedData);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await this.grpcClient.call(
        this.workflowsService.getWorkflowById({
          $type: 'api.workflows.GetWorkflowByIdRequest',
          user: this.userToProtoUser(user),
          workflowId,
        }),
        'WorkflowsController.getWorkflowById',
      );
      await this.cacheManager.set(cacheKey, response, CACHE_TTL_1_MINUTE);
      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Creates a new workflow
   * @param {User} user - The authenticated user
   * @param {CreateWorkflowDto} createWorkflowDto - Workflow creation data
   * @returns {Promise<WorkflowsProto.Workflow>} The created workflow
   */
  @ApiOperation({ summary: 'Create new workflow' })
  @ApiBody({ type: CreateWorkflowDto })
  @ApiResponse({
    status: 201,
    description: 'Workflow created successfully',
    type: JSON.stringify(WorkflowsProto.Workflow),
  })
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 requests per minute
  @Post()
  @SetMetadata(IGNORE_CACHE_KEY, true)
  public async createWorkflow(
    @CurrentUser() user: User,
    @Body() createWorkflowDto: CreateWorkflowDto,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    try {
      const response = await this.grpcClient.call(
        this.workflowsService.createWorkflow({
          $type: 'api.workflows.CreateWorkflowRequest',
          user: this.userToProtoUser(user),
          name: createWorkflowDto.name,
          description: createWorkflowDto.description,
        }),
        'WorkflowsController.createWorkflow',
      );
      await this.cacheInterceptor.invalidateCache(
        `${CACHE_KEY_PREFIX}:*:user:${String(user.id)}*`,
      );
      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Delete(':id')
  public async deleteWorkflow(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) workflowId: number,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    try {
      const response = await this.grpcClient.call(
        this.workflowsService.deleteWorkflow({
          $type: 'api.workflows.DeleteWorkflowRequest',
          user: this.userToProtoUser(user),
          workflowId,
        }),
        'WorkflowsController.deleteWorkflow',
      );
      await this.invalidateUserCaches(user.id);
      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Post('duplicate')
  public async duplicateWorkflow(
    @CurrentUser() user: User,
    @Body() duplicateWorkflowDto: DuplicateWorkflowDto,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    try {
      const response = await this.grpcClient.call(
        this.workflowsService.duplicateWorkflow({
          $type: 'api.workflows.DuplicateWorkflowRequest',
          user: this.userToProtoUser(user),
          workflowId: duplicateWorkflowDto.workflowId,
          name: duplicateWorkflowDto.name,
          description: duplicateWorkflowDto.description,
        }),
        'WorkflowsController.duplicateWorkflow',
      );
      await this.invalidateUserCaches(user.id);
      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Post(':id/publish')
  public async publishWorkflow(
    @CurrentUser() user: User,
    @Body() publishWorkflowDto: PublishWorkflowDto,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    try {
      const response = await this.grpcClient.call(
        this.workflowsService.publishWorkflow({
          $type: 'api.workflows.PublishWorkflowRequest',
          user: this.userToProtoUser(user),
          workflowId: publishWorkflowDto.workflowId,
          flowDefinition: publishWorkflowDto.flowDefinition,
        }),
        'WorkflowsController.publishWorkflow',
      );
      await this.invalidateUserCaches(user.id);
      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Post(':id/unpublish')
  public async unpublishWorkflow(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) workflowId: number,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    try {
      const response = await this.grpcClient.call(
        this.workflowsService.unpublishWorkflow({
          $type: 'api.workflows.UnpublishWorkflowRequest',
          user: this.userToProtoUser(user),
          workflowId,
        }),
        'WorkflowsController.unpublishWorkflow',
      );
      await this.invalidateUserCaches(user.id);
      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Runs a workflow
   * @param {User} user - The authenticated user
   * @param {RunWorkflowDto} runWorkflowDto - Workflow execution parameters
   * @returns {Promise<WorkflowsProto.RunWorkflowResponse>} Execution response
   */
  @ApiOperation({ summary: 'Run workflow' })
  @ApiBody({ type: RunWorkflowDto })
  @ApiResponse({
    status: 200,
    description: 'Workflow execution started',
    type: JSON.stringify(WorkflowsProto.RunWorkflowResponse),
  })
  @Throttle({ default: { ttl: 60000, limit: 3 } }) // 3 requests per minute
  @Post('run-workflow')
  public async runWorkflow(
    @CurrentUser() user: User,
    @Body() runWorkflowDto: RunWorkflowDto,
  ): Promise<WorkflowsProto.RunWorkflowResponse> {
    try {
      const response = await this.grpcClient.call(
        this.workflowsService.runWorkflow({
          $type: 'api.workflows.RunWorkflowRequest',
          user: this.userToProtoUser(user),
          workflowId: runWorkflowDto.workflowId,
          flowDefinition: runWorkflowDto.flowDefinition ?? '',
          componentId: String(runWorkflowDto.componentId),
        }),
        'WorkflowsController.runWorkflow',
      );
      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Patch('')
  public async updateWorkflow(
    @CurrentUser() user: User,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    try {
      const response = await this.grpcClient.call(
        this.workflowsService.updateWorkflow({
          $type: 'api.workflows.UpdateWorkflowRequest',
          user: this.userToProtoUser(user),
          workflowId: updateWorkflowDto.workflowId,
          definition: updateWorkflowDto.definition,
        }),
        'WorkflowsController.updateWorkflow',
      );
      await this.cacheInterceptor.invalidateCache(
        `${CACHE_KEY_PREFIX}:*:user:${String(user.id)}*`,
      );
      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Get('historic')
  public async getHistoricWorkflowExecutions(
    @CurrentUser() user: User,
    @Query('workflowId', ParseIntPipe) workflowId: number,
  ): Promise<WorkflowsProto.WorkflowExecutionsResponse> {
    try {
      const response = await this.grpcClient.call(
        this.workflowsService.getHistoricWorkflowExecutions({
          $type: 'api.workflows.GetHistoricRequest',
          user: this.userToProtoUser(user),
          workflowId,
        }),
        'WorkflowsController.getHistoricWorkflowExecutions',
      );
      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Get('executions')
  public async getWorkflowExecutions(
    @CurrentUser() user: User,
    @Query('executionId') executionId: string | number,
  ): Promise<WorkflowsProto.WorkflowExecutionDetailResponse> {
    try {
      const response = await this.grpcClient.call(
        this.workflowsService.getWorkflowExecutions({
          $type: 'api.workflows.GetExecutionsRequest',
          user: this.userToProtoUser(user),
          executionId: Number(executionId),
        }),
        'WorkflowsController.getWorkflowExecutions',
      );
      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Get('phases/:id')
  public async getWorkflowPhase(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) phaseId: number,
  ): Promise<WorkflowsProto.PhaseResponse> {
    try {
      const response = await this.grpcClient.call(
        this.workflowsService.getWorkflowPhase({
          $type: 'api.workflows.GetPhaseRequest',
          user: this.userToProtoUser(user),
          phaseId,
        }),
        'WorkflowsController.getWorkflowPhase',
      );
      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
