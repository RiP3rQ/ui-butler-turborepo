import {
  ApproveChangesDto,
  CurrentUser,
  JwtAuthGuard,
  type User,
} from '@microservices/common';
import { ExecutionProto } from '@microservices/proto';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Post,
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
const CACHE_KEY_PENDING_CHANGES = 'pending-changes';

/**
 * Controller handling workflow execution operations through gRPC communication
 * with the execution microservice.
 * @class ExecutionsController
 */
@ApiTags('Executions')
@ApiBearerAuth()
@Controller('executions')
@UseGuards(JwtAuthGuard)
export class ExecutionsController implements OnModuleInit {
  private executionsService: ExecutionProto.ExecutionsServiceClient;

  constructor(
    @Inject('EXECUTION_SERVICE') private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
  ) {}

  public onModuleInit(): void {
    this.executionsService =
      this.client.getService<ExecutionProto.ExecutionsServiceClient>(
        'ExecutionsService',
      );
  }

  /**
   * Converts a User to ExecutionProto.User
   * @private
   * @param {User} user - User to convert
   * @returns {ExecutionProto.User} Converted user for proto messages
   */
  private userToProtoUser(user: User): ExecutionProto.User {
    if (!user.id) {
      throw new NotFoundException('Unauthorized: User not found');
    }

    return {
      $type: 'api.execution.User',
      id: String(user.id),
      email: user.email,
    };
  }

  /**
   * Retrieves pending changes for a workflow execution
   * @param {User} user - The authenticated user
   * @param {number} executionId - Execution identifier
   * @returns {Promise<{pendingApproval: Record<string, string>; status: string}>} Pending changes and status
   * @throws {NotFoundException} When user or execution is not found
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Get pending changes for execution' })
  @ApiParam({ name: 'executionId', type: Number, description: 'Execution ID' })
  @ApiResponse({
    status: 200,
    description: 'Pending changes retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        pendingApproval: {
          type: 'object',
          additionalProperties: { type: 'string' },
        },
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User or execution not found' })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @UseInterceptors(CacheInterceptor)
  @CacheKey(CACHE_KEY_PENDING_CHANGES)
  @CacheTTL(CACHE_TTL_1_MINUTE)
  @Get(':executionId/pending-changes')
  public async getPendingChanges(
    @CurrentUser() user: User,
    @Param('executionId', ParseIntPipe) executionId: number,
  ): Promise<{
    pendingApproval: ExecutionProto.PendingChangesResponse['pendingApproval'];
    status: string;
  }> {
    try {
      const request: ExecutionProto.GetPendingChangesRequest = {
        $type: 'api.execution.GetPendingChangesRequest',
        user: this.userToProtoUser(user),
        executionId,
      };

      const response = await this.grpcClient.call(
        this.executionsService.getPendingChanges(request),
        'Executions.getPendingChanges',
      );

      return {
        pendingApproval: response.pendingApproval,
        status: response.status,
      };
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Approves or rejects pending changes for a workflow execution
   * @param {User} user - The authenticated user
   * @param {number} executionId - Execution identifier
   * @param {ApproveChangesDto} body - Approval decision
   * @returns {Promise<{message: string; status: string}>} Approval result
   * @throws {NotFoundException} When user or execution is not found
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Approve or reject pending changes' })
  @ApiParam({ name: 'executionId', type: Number, description: 'Execution ID' })
  @ApiBody({ type: ApproveChangesDto })
  @ApiResponse({
    status: 200,
    description: 'Changes approved/rejected successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User or execution not found' })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @Throttle({ default: { ttl: 60000, limit: 10 } }) // 10 requests per minute
  @Post(':executionId/approve')
  public async approveChanges(
    @CurrentUser() user: User,
    @Param('executionId', ParseIntPipe) executionId: number,
    @Body() body: ApproveChangesDto,
  ): Promise<{
    message: string;
    status: string;
  }> {
    try {
      const request: ExecutionProto.ApproveChangesRequest = {
        $type: 'api.execution.ApproveChangesRequest',
        user: this.userToProtoUser(user),
        executionId,
        body: {
          $type: 'api.execution.ApproveChangesBody',
          decision: body.decision,
        },
      };

      return await this.grpcClient.call(
        this.executionsService.approveChanges(request),
        'Executions.approveChanges',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
