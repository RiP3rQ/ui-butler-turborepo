import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApproveChangesDto, User } from '@app/common';
import { ExecutionsService } from './execution.service';

@Controller()
export class ExecutionsController {
  private readonly logger = new Logger(ExecutionsController.name);
  constructor(private readonly executionsService: ExecutionsService) {}

  @MessagePattern('executions.pending-changes')
  async getPendingChanges(
    @Payload() data: { user: User; executionId: number },
  ) {
    this.logger.debug('Getting pending changes', data.executionId);
    return this.executionsService.getPendingChanges(
      data.user,
      data.executionId,
    );
  }

  @MessagePattern('executions.approve')
  async approveChanges(
    @Payload()
    data: {
      user: User;
      executionId: number;
      body: ApproveChangesDto;
    },
  ) {
    this.logger.debug('Approving changes', JSON.stringify(data));
    return this.executionsService.approveChanges(
      data.user,
      data.executionId,
      data.body,
    );
  }

  @MessagePattern('executions.execute')
  async executeWorkflow(
    @Payload()
    data: {
      workflowExecutionId: number;
      componentId: number;
      nextRunAt?: Date;
    },
  ) {
    this.logger.debug(
      `Executing workflow ${data.workflowExecutionId} with component ${data.componentId}`,
    );
    return this.executionsService.executeWorkflow(
      data.workflowExecutionId,
      data.componentId,
      data.nextRunAt,
    );
  }
}
