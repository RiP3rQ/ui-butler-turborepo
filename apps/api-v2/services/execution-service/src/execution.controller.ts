import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApproveChangesDto } from '@app/common';
import { ExecutionsService } from './execution.service';
import { ExecutionProto } from '@app/proto';

@Controller()
export class ExecutionsController {
  private readonly logger = new Logger(ExecutionsController.name);

  constructor(private readonly executionsService: ExecutionsService) {}

  private protoUserToUser(protoUser: ExecutionProto.User) {
    return {
      id: Number(protoUser.id),
      email: protoUser.email,
    };
  }

  @GrpcMethod('ExecutionsService', 'GetPendingChanges')
  async getPendingChanges(request: ExecutionProto.GetPendingChangesRequest) {
    this.logger.debug('Getting pending changes', request.executionId);
    const result = await this.executionsService.getPendingChanges(
      this.protoUserToUser(request.user),
      request.executionId,
    );
    return {
      $type: 'api.executions.PendingChangesResponse',
      pendingApproval: result.pendingApproval,
      status: result.status,
    };
  }

  @GrpcMethod('ExecutionsService', 'ApproveChanges')
  async approveChanges(request: ExecutionProto.ApproveChangesRequest) {
    this.logger.debug('Approving changes', JSON.stringify(request));
    const approveChangesDto: ApproveChangesDto = {
      decision: request.body.decision,
    };
    const result = await this.executionsService.approveChanges(
      this.protoUserToUser(request.user),
      request.executionId,
      approveChangesDto,
    );
    return {
      $type: 'api.executions.ApproveChangesResponse',
      message: result.message,
      status: result.status,
    };
  }

  @GrpcMethod('ExecutionsService', 'Execute')
  async executeWorkflow(request: ExecutionProto.ExecuteWorkflowRequest) {
    this.logger.debug(
      `Executing workflow ${request.workflowExecutionId} with component ${request.componentId}`,
    );
    await this.executionsService.executeWorkflow(
      request.workflowExecutionId,
      request.componentId,
      request.nextRunAt ? new Date(request.nextRunAt) : undefined,
    );
    return {};
  }
}
