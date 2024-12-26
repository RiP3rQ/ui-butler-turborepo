import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ExecutionsService } from './execution.service';
import { ExecutionProto } from '@app/proto';

@Controller()
export class ExecutionsController {
  private readonly logger = new Logger(ExecutionsController.name);

  constructor(private readonly executionsService: ExecutionsService) {}

  @GrpcMethod('ExecutionsService', 'GetPendingChanges')
  async getPendingChanges(request: ExecutionProto.GetPendingChangesRequest) {
    this.logger.debug('Getting pending changes', request.executionId);
    return this.executionsService.getPendingChanges(
      request.user,
      request.executionId,
    );
  }

  @GrpcMethod('ExecutionsService', 'ApproveChanges')
  async approveChanges(request: ExecutionProto.ApproveChangesRequest) {
    this.logger.debug('Approving changes', JSON.stringify(request));
    return this.executionsService.approveChanges(
      request.user,
      request.executionId,
      request.body,
    );
  }

  @GrpcMethod('ExecutionsService', 'Execute')
  async executeWorkflow(request: ExecutionProto.ExecuteWorkflowRequest) {
    this.logger.debug(
      `Executing workflow ${request.workflowExecutionId} with component ${request.componentId}`,
    );
    return this.executionsService.executeWorkflow(
      request.workflowExecutionId,
      request.componentId,
      request.nextRunAt ? new Date(request.nextRunAt) : undefined,
    );
  }
}
