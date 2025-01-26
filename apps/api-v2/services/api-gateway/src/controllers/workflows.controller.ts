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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RateLimit } from 'src/decorators/rate-limit.decorator';
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';
import { handleGrpcError } from '../utils/grpc-error.util';
// import {
//   CUSTOM_CACHE_KEY_PREFIX,
//   // CustomCacheInterceptor,
//   IGNORE_CACHE_KEY,
//   CACHE_KEY_METADATA,
//   CACHE_TTL_METADATA,
// } from '../interceptors/custom-cache.interceptor';

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
// @UseInterceptors(CustomCacheInterceptor)
export class WorkflowsController implements OnModuleInit {
  private workflowsService: WorkflowsProto.WorkflowsServiceClient;

  constructor(
    @Inject('WORKFLOWS_SERVICE') private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
    // private readonly customCacheInterceptor: CustomCacheInterceptor,
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
    const pattern = `$${CACHE_KEY_PREFIX}:*:user:${String(userId)}*`;
    // await this.customCacheInterceptor.invalidateCache(pattern);
  }

  /**
   * Retrieves all workflows for the authenticated user
   * @param {User} user - The authenticated user
   * @returns {Promise<WorkflowsProto.WorkflowsResponse>} List of user's workflows
   * @throws {NotFoundException} When user is not found
   */
  @ApiOperation({ summary: 'Get all workflows for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Workflows retrieved successfully',
    type: 'WorkflowsResponse',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'No workflows found' })
  // @SetMetadata(CACHE_TTL_METADATA, CACHE_TTL_5_MINUTES)
  // @SetMetadata(CACHE_KEY_METADATA, 'workflows:list')
  @Get()
  public async getAllUserWorkflows(
    @CurrentUser() user: User,
  ): Promise<WorkflowsProto.WorkflowsResponse> {
    try {
      const response = await this.grpcClient.call(
        this.workflowsService.getAllUserWorkflows({
          $type: 'api.workflows.GetAllUserWorkflowsRequest',
          user: this.userToProtoUser(user),
        }),
        'WorkflowsController.getAllUserWorkflows',
      );
      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Retrieves a specific workflow by ID
   * @param {User} user - The authenticated user
   * @param {number} workflowId - The ID of the workflow to retrieve
   * @returns {Promise<WorkflowsProto.WorkflowResponse>} The requested workflow
   * @throws {NotFoundException} When workflow is not found
   */
  @ApiOperation({ summary: 'Get workflow by ID' })
  // @SetMetadata(CACHE_TTL_METADATA, CACHE_TTL_1_MINUTE)
  // @SetMetadata(CACHE_KEY_METADATA, 'workflows:detail')
  @ApiParam({
    name: 'workflowId',
    type: 'number',
    description: 'Workflow identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Workflow retrieved successfully',
    type: 'WorkflowResponse',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  @Get('get-by-id/:workflowId')
  public async getWorkflowById(
    @CurrentUser() user: User,
    @Param('workflowId', ParseIntPipe) workflowId: number,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    try {
      const response = await this.grpcClient.call(
        this.workflowsService.getWorkflowById({
          $type: 'api.workflows.GetWorkflowByIdRequest',
          user: this.userToProtoUser(user),
          workflowId,
        }),
        'WorkflowsController.getWorkflowById',
      );
      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Creates a new workflow
   * @param {User} user - The authenticated user
   * @param {CreateWorkflowDto} createWorkflowDto - The workflow creation data
   * @returns {Promise<WorkflowsProto.WorkflowResponse>} The created workflow
   */
  @ApiOperation({ summary: 'Create new workflow' })
  // @SetMetadata(IGNORE_CACHE_KEY, true)
  @ApiBody({ type: CreateWorkflowDto })
  @ApiResponse({
    status: 201,
    description: 'Workflow created successfully',
    type: 'WorkflowResponse',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @RateLimit({
    ttl: 60,
    limit: 5,
    errorMessage: 'Too many create workflow requests. Try again in 1 minute.',
  })
  @Post()
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
      await this.invalidateUserCaches(user.id);
      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Deletes a workflow
   * @param {User} user - The authenticated user
   * @param {number} workflowId - The ID of the workflow to delete
   * @returns {Promise<WorkflowsProto.WorkflowResponse>} The deleted workflow
   */
  @ApiOperation({ summary: 'Delete workflow' })
  @ApiParam({ name: 'id', type: 'number', description: 'Workflow identifier' })
  @ApiResponse({ status: 200, description: 'Workflow deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  // @SetMetadata(IGNORE_CACHE_KEY, true)
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

  /**
   * Duplicates an existing workflow
   * @param {User} user - The authenticated user
   * @param {DuplicateWorkflowDto} duplicateWorkflowDto - Workflow duplication parameters
   * @returns {Promise<WorkflowsProto.WorkflowResponse>} The duplicated workflow
   * @throws {NotFoundException} When source workflow is not found
   */
  @ApiOperation({ summary: 'Duplicate existing workflow' })
  @ApiBody({ type: DuplicateWorkflowDto })
  @ApiResponse({
    status: 201,
    description: 'Workflow duplicated successfully',
    type: 'WorkflowResponse',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Source workflow not found' })
  // @SetMetadata(IGNORE_CACHE_KEY, true)
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

  /**
   * Publishes a workflow making it available for execution
   * @param {User} user - The authenticated user
   * @param {PublishWorkflowDto} publishWorkflowDto - Workflow publication data
   * @returns {Promise<WorkflowsProto.WorkflowResponse>} The published workflow
   * @throws {NotFoundException} When workflow is not found
   */
  @ApiOperation({ summary: 'Publish workflow' })
  @ApiBody({ type: PublishWorkflowDto })
  @ApiResponse({
    status: 200,
    description: 'Workflow published successfully',
    type: 'WorkflowResponse',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  // @SetMetadata(IGNORE_CACHE_KEY, true)
  @RateLimit({
    ttl: 60,
    limit: 3,
    errorMessage: 'Too many publish workflow requests. Try again in 1 minute.',
  })
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

  /**
   * Unpublishes a workflow, making it unavailable for execution
   * @param {User} user - The authenticated user
   * @param {number} workflowId - The ID of the workflow to unpublish
   * @returns {Promise<WorkflowsProto.WorkflowResponse>} The unpublished workflow
   * @throws {NotFoundException} When workflow is not found
   */
  @ApiOperation({ summary: 'Unpublish workflow' })
  @ApiParam({ name: 'id', type: 'number', description: 'Workflow identifier' })
  @ApiResponse({
    status: 200,
    description: 'Workflow unpublished successfully',
    type: 'WorkflowResponse',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  // @SetMetadata(IGNORE_CACHE_KEY, true)
  @RateLimit({
    ttl: 60,
    limit: 3,
    errorMessage:
      'Too many unpublish workflow requests. Try again in 1 minute.',
  })
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
  @RateLimit({
    ttl: 60,
    limit: 2,
    errorMessage: 'Too many run workflow requests. Try again in 1 minute.',
  }) // 2 requests per minute
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

  /**
   * Updates an existing workflow
   * @param {User} user - The authenticated user
   * @param {UpdateWorkflowDto} updateWorkflowDto - Workflow update data
   * @returns {Promise<WorkflowsProto.WorkflowResponse>} The updated workflow
   * @throws {NotFoundException} When workflow is not found
   */
  @ApiOperation({ summary: 'Update workflow' })
  @ApiBody({ type: UpdateWorkflowDto })
  @ApiResponse({
    status: 200,
    description: 'Workflow updated successfully',
    type: 'WorkflowResponse',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  // 5 requests per minute
  @RateLimit({
    limit: 5,
    ttl: 60,
    errorMessage: 'Too many save workflow requests. Try again in 1 minute.',
  })
  // @SetMetadata(IGNORE_CACHE_KEY, true)
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
      // Invalidate all workflow-related caches for this user
      await this.invalidateUserCaches(user.id);
      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Retrieves workflow execution history
   * @param {User} user - The authenticated user
   * @param {number} workflowId - The workflow ID to get history for
   * @returns {Promise<WorkflowsProto.WorkflowExecutionsResponse>} List of workflow executions
   */
  @ApiOperation({ summary: 'Get workflow execution history' })
  // @SetMetadata(CACHE_TTL_METADATA, CACHE_TTL_1_MINUTE)
  // @SetMetadata(CACHE_KEY_METADATA, 'workflows:history')
  @ApiQuery({
    name: 'workflowId',
    type: 'number',
    description: 'Workflow identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Execution history retrieved successfully',
    type: 'WorkflowExecutionsResponse',
  })
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

  /**
   * Retrieves detailed execution information for a workflow
   * @param {User} user - The authenticated user
   * @param {string | number} executionId - The execution identifier
   * @returns {Promise<WorkflowsProto.WorkflowExecutionDetailResponse>} Detailed execution information
   * @throws {NotFoundException} When execution is not found
   */
  @ApiOperation({ summary: 'Get workflow execution details' })
  // @SetMetadata(CACHE_TTL_METADATA, CACHE_TTL_1_MINUTE)
  // @SetMetadata(CACHE_KEY_METADATA, 'workflows:execution')
  @ApiQuery({
    name: 'executionId',
    type: 'string',
    description: 'Execution identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Execution details retrieved successfully',
    type: 'WorkflowExecutionDetailResponse',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
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

  /**
   * Retrieves details of a specific execution phase
   * @param {User} user - The authenticated user
   * @param {number} phaseId - The phase identifier
   * @returns {Promise<WorkflowsProto.PhaseResponse>} Phase details
   * @throws {NotFoundException} When phase is not found
   */
  @ApiOperation({ summary: 'Get workflow phase details' })
  // @SetMetadata(CACHE_TTL_METADATA, CACHE_TTL_1_MINUTE)
  // @SetMetadata(CACHE_KEY_METADATA, 'workflows:phase')
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Phase identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Phase details retrieved successfully',
    type: 'PhaseResponse',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Phase not found' })
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
