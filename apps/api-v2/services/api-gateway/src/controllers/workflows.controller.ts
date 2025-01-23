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
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
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
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';
import { handleGrpcError } from '../utils/grpc-error.util';

const CACHE_TTL_1_MINUTE = 60000;
const CACHE_TTL_5_MINUTES = 300000;
const CACHE_KEY_USER_WORKFLOWS = 'user-workflows';
const CACHE_KEY_WORKFLOW_DETAILS = 'workflow-details';

/**
 * Controller handling workflow-related operations through gRPC communication
 * with the workflows microservice.
 * @class WorkflowsController
 */
@ApiTags('Workflows')
@ApiBearerAuth()
@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController implements OnModuleInit {
  private workflowsService: WorkflowsProto.WorkflowsServiceClient;

  constructor(
    @Inject('WORKFLOWS_SERVICE') private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
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
  @UseInterceptors(CacheInterceptor)
  @CacheKey(CACHE_KEY_USER_WORKFLOWS)
  @CacheTTL(CACHE_TTL_5_MINUTES)
  @Get()
  public async getAllUserWorkflows(
    @CurrentUser() user: User,
  ): Promise<WorkflowsProto.WorkflowsResponse> {
    try {
      if (!user.id) {
        throw new NotFoundException('Unauthorized: User not found');
      }

      const request: WorkflowsProto.GetAllUserWorkflowsRequest = {
        $type: 'api.workflows.GetAllUserWorkflowsRequest',
        user: this.userToProtoUser(user),
      };

      return await this.grpcClient.call(
        this.workflowsService.getAllUserWorkflows(request),
        'WorkflowsController.getAllUserWorkflows',
      );
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
  @CacheKey(CACHE_KEY_WORKFLOW_DETAILS)
  @CacheTTL(CACHE_TTL_1_MINUTE)
  @Get('get-by-id/:workflowId')
  public async getWorkflowById(
    @CurrentUser() user: User,
    @Param('workflowId', ParseIntPipe) workflowId: number,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    try {
      if (!user.id) {
        throw new NotFoundException('Unauthorized: User not found');
      }

      const request: WorkflowsProto.GetWorkflowByIdRequest = {
        $type: 'api.workflows.GetWorkflowByIdRequest',
        user: this.userToProtoUser(user),
        workflowId,
      };

      return await this.grpcClient.call(
        this.workflowsService.getWorkflowById(request),
        'WorkflowsController.getWorkflowById',
      );
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
  public async createWorkflow(
    @CurrentUser() user: User,
    @Body() createWorkflowDto: CreateWorkflowDto,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    try {
      if (!user.id) {
        throw new NotFoundException('Unauthorized: User not found');
      }

      const request: WorkflowsProto.CreateWorkflowRequest = {
        $type: 'api.workflows.CreateWorkflowRequest',
        user: this.userToProtoUser(user),
        name: createWorkflowDto.name,
        description: createWorkflowDto.description,
      };

      return await this.grpcClient.call(
        this.workflowsService.createWorkflow(request),
        'WorkflowsController.createWorkflow',
      );
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
      if (!user.id) {
        throw new NotFoundException('Unauthorized: User not found');
      }

      const request: WorkflowsProto.DeleteWorkflowRequest = {
        $type: 'api.workflows.DeleteWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId,
      };

      return await this.grpcClient.call(
        this.workflowsService.deleteWorkflow(request),
        'WorkflowsController.deleteWorkflow',
      );
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
      if (!user.id) {
        throw new NotFoundException('Unauthorized: User not found');
      }

      const request: WorkflowsProto.DuplicateWorkflowRequest = {
        $type: 'api.workflows.DuplicateWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId: duplicateWorkflowDto.workflowId,
        name: duplicateWorkflowDto.name,
        description: duplicateWorkflowDto.description,
      };

      return await this.grpcClient.call(
        this.workflowsService.duplicateWorkflow(request),
        'WorkflowsController.duplicateWorkflow',
      );
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
      if (!user.id) {
        throw new NotFoundException('Unauthorized: User not found');
      }

      const request: WorkflowsProto.PublishWorkflowRequest = {
        $type: 'api.workflows.PublishWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId: publishWorkflowDto.workflowId,
        flowDefinition: publishWorkflowDto.flowDefinition,
      };

      return await this.grpcClient.call(
        this.workflowsService.publishWorkflow(request),
        'WorkflowsController.publishWorkflow',
      );
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
      if (!user.id) {
        throw new NotFoundException('Unauthorized: User not found');
      }

      const request: WorkflowsProto.UnpublishWorkflowRequest = {
        $type: 'api.workflows.UnpublishWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId,
      };

      return await this.grpcClient.call(
        this.workflowsService.unpublishWorkflow(request),
        'WorkflowsController.unpublishWorkflow',
      );
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
      if (!user.id) {
        throw new NotFoundException('Unauthorized: User not found');
      }

      const request: WorkflowsProto.RunWorkflowRequest = {
        $type: 'api.workflows.RunWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId: runWorkflowDto.workflowId,
        flowDefinition: runWorkflowDto.flowDefinition ?? '',
        componentId: String(runWorkflowDto.componentId),
      };

      return await this.grpcClient.call(
        this.workflowsService.runWorkflow(request),
        'WorkflowsController.runWorkflow',
      );
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
      if (!user.id) {
        throw new NotFoundException('Unauthorized: User not found');
      }

      const request: WorkflowsProto.UpdateWorkflowRequest = {
        $type: 'api.workflows.UpdateWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId: updateWorkflowDto.workflowId,
        definition: updateWorkflowDto.definition,
      };

      return await this.grpcClient.call(
        this.workflowsService.updateWorkflow(request),
        'WorkflowsController.updateWorkflow',
      );
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
      if (!user.id) {
        throw new NotFoundException('Unauthorized: User not found');
      }

      const request: WorkflowsProto.GetHistoricRequest = {
        $type: 'api.workflows.GetHistoricRequest',
        user: this.userToProtoUser(user),
        workflowId,
      };

      return await this.grpcClient.call(
        this.workflowsService.getHistoricWorkflowExecutions(request),
        'WorkflowsController.getHistoricWorkflowExecutions',
      );
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
      if (!user.id) {
        throw new NotFoundException('Unauthorized: User not found');
      }

      const request: WorkflowsProto.GetExecutionsRequest = {
        $type: 'api.workflows.GetExecutionsRequest',
        user: this.userToProtoUser(user),
        executionId: Number(executionId),
      };

      return await this.grpcClient.call(
        this.workflowsService.getWorkflowExecutions(request),
        'WorkflowsController.getWorkflowExecutions',
      );
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
      if (!user.id) {
        throw new NotFoundException('Unauthorized: User not found');
      }

      const request: WorkflowsProto.GetPhaseRequest = {
        $type: 'api.workflows.GetPhaseRequest',
        user: this.userToProtoUser(user),
        phaseId,
      };

      return await this.grpcClient.call(
        this.workflowsService.getWorkflowPhase(request),
        'WorkflowsController.getWorkflowPhase',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
