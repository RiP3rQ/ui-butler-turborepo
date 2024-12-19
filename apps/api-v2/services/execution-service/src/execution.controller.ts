import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApproveChangesDto, User } from '@app/common';
import { ExecutionsService } from './execution.service';

@Controller()
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @MessagePattern('executions.pending-changes')
  async getPendingChanges(
    @Payload() data: { user: User; executionId: number },
  ) {
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
    return this.executionsService.executeWorkflow(
      data.workflowExecutionId,
      data.componentId,
      data.nextRunAt,
    );
  }
}
