import { User } from '@app/common';
import { ExecutionProto } from '@microservices/proto';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ExecutionsService } from './execution.service';

@Controller()
export class ExecutionsController {
  private readonly logger = new Logger(ExecutionsController.name);

  constructor(private readonly executionsService: ExecutionsService) {}

  private protoUserToUser(protoUser: ExecutionProto.User): User {
    return {
      id: Number(protoUser.id),
      email: protoUser.email,
    };
  }

  @GrpcMethod('ExecutionsService', 'GetPendingChanges')
  public async getPendingChanges(
    request: ExecutionProto.GetPendingChangesRequest,
  ): Promise<ExecutionProto.PendingChangesResponse> {
    this.logger.debug('Getting pending changes', request.executionId);
    return await this.executionsService.getPendingChanges(request);
  }

  @GrpcMethod('ExecutionsService', 'ApproveChanges')
  public async approveChanges(
    request: ExecutionProto.ApproveChangesRequest,
  ): Promise<ExecutionProto.ApproveChangesResponse> {
    this.logger.debug('Approving changes', JSON.stringify(request));
    return await this.executionsService.approveChanges(request);
  }

  @GrpcMethod('ExecutionsService', 'Execute')
  public async executeWorkflow(
    request: ExecutionProto.ExecuteWorkflowRequest,
  ): Promise<ExecutionProto.Empty> {
    this.logger.debug(
      `Executing workflow ${String(request.workflowExecutionId)} with component ${String(request.componentId)}`,
    );
    await this.executionsService.executeWorkflow(request);
    return {
      $type: 'api.execution.Empty',
    };
  }
}
