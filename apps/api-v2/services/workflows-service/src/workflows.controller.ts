import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WorkflowsService } from './workflows.service';
import {
  CreateWorkflowDto,
  DuplicateWorkflowDto,
  PublishWorkflowDto,
  RunWorkflowDto,
  UpdateWorkflowDto,
  User,
} from '@app/common';

@Controller()
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @MessagePattern('workflows.get-all')
  async getAllUserWorkflows(@Payload() data: { user: User }) {
    return this.workflowsService.getAllUserWorkflows(data.user);
  }

  @MessagePattern('workflows.get-by-id')
  async getWorkflowById(@Payload() data: { user: User; workflowId: number }) {
    return this.workflowsService.getWorkflowById(data.user, data.workflowId);
  }

  @MessagePattern('workflows.create')
  async createWorkflow(
    @Payload() data: { user: User; createWorkflowDto: CreateWorkflowDto },
  ) {
    return this.workflowsService.createWorkflow(
      data.user,
      data.createWorkflowDto,
    );
  }

  @MessagePattern('workflows.delete')
  async deleteWorkflow(@Payload() data: { user: User; workflowId: number }) {
    return this.workflowsService.deleteWorkflow(data.user, data.workflowId);
  }

  @MessagePattern('workflows.duplicate')
  async duplicateWorkflow(
    @Payload() data: { user: User; duplicateWorkflowDto: DuplicateWorkflowDto },
  ) {
    return this.workflowsService.duplicateWorkflow(
      data.user,
      data.duplicateWorkflowDto,
    );
  }

  @MessagePattern('workflows.publish')
  async publishWorkflow(
    @Payload() data: { user: User; publishWorkflowDto: PublishWorkflowDto },
  ) {
    return this.workflowsService.publishWorkflow(
      data.user,
      data.publishWorkflowDto,
    );
  }

  @MessagePattern('workflows.unpublish')
  async unpublishWorkflow(@Payload() data: { user: User; workflowId: number }) {
    return this.workflowsService.unpublishWorkflow(data.user, data.workflowId);
  }

  @MessagePattern('workflows.run')
  async runWorkflow(
    @Payload() data: { user: User; runWorkflowDto: RunWorkflowDto },
  ) {
    return this.workflowsService.runWorkflow(data.user, data.runWorkflowDto);
  }

  @MessagePattern('workflows.update')
  async updateWorkflow(
    @Payload() data: { user: User; updateWorkflowDto: UpdateWorkflowDto },
  ) {
    return this.workflowsService.updateWorkflow(
      data.user,
      data.updateWorkflowDto,
    );
  }

  @MessagePattern('workflows.historic')
  async getHistoricWorkflowExecutions(
    @Payload() data: { user: User; workflowId: number },
  ) {
    return this.workflowsService.getHistoricWorkflowExecutions(
      data.user,
      data.workflowId,
    );
  }

  @MessagePattern('workflows.executions')
  async getWorkflowExecutions(
    @Payload() data: { user: User; executionId: number },
  ) {
    return this.workflowsService.getWorkflowExecutions(
      data.user,
      data.executionId,
    );
  }

  @MessagePattern('workflows.phases')
  async getWorkflowPhase(@Payload() data: { user: User; phaseId: number }) {
    return this.workflowsService.getWorkflowPhase(data.user, data.phaseId);
  }
}
