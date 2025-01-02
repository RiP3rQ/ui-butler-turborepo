import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  ApproveChangesDto,
  CurrentUser,
  JwtAuthGuard,
  type User,
} from '@app/common';
import { ExecutionProto } from '@app/proto';
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';

@Controller('executions')
@UseGuards(JwtAuthGuard)
export class ExecutionsController implements OnModuleInit {
  private executionsService: ExecutionProto.ExecutionsServiceClient;

  constructor(
    @Inject('EXECUTION_SERVICE') private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
  ) {}

  onModuleInit() {
    this.executionsService =
      this.client.getService<ExecutionProto.ExecutionsServiceClient>(
        'ExecutionsService',
      );
  }

  private userToProtoUser(user: User): ExecutionProto.User {
    return {
      $type: 'api.execution.User',
      id: String(user.id),
      email: user.email,
    };
  }

  @Get(':executionId/pending-changes')
  async getPendingChanges(
    @CurrentUser() user: User,
    @Param('executionId', ParseIntPipe) executionId: number,
  ) {
    const response = await this.grpcClient.call(
      this.executionsService.getPendingChanges({
        $type: 'api.execution.GetPendingChangesRequest',
        user: this.userToProtoUser(user),
        executionId,
      }),
      'Executions.getPendingChanges',
    );

    return {
      pendingApproval: response.pendingApproval,
      status: response.status,
    };
  }

  @Post(':executionId/approve')
  async approveChanges(
    @CurrentUser() user: User,
    @Param('executionId', ParseIntPipe) executionId: number,
    @Body() body: ApproveChangesDto,
  ) {
    const response = await this.grpcClient.call(
      this.executionsService.approveChanges({
        $type: 'api.execution.ApproveChangesRequest',
        user: this.userToProtoUser(user),
        executionId,
        body: {
          $type: 'api.execution.ApproveChangesBody',
          decision: body.decision,
        },
      }),
      'Executions.approveChanges',
    );
    return {
      message: response.message,
      status: response.status,
    };
  }
}
