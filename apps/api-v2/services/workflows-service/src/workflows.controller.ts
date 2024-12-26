import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WorkflowsService } from './workflows.service';
import {
  CreateWorkflowDto,
  DuplicateWorkflowDto,
  PublishWorkflowDto,
  RunWorkflowDto,
  UpdateWorkflowDto,
} from '@app/common';
import { WorkflowsProto } from '@app/proto';

@Controller()
export class WorkflowsController {
  private readonly logger = new Logger(WorkflowsController.name);

  constructor(private readonly workflowsService: WorkflowsService) {}

  @GrpcMethod('WorkflowsService', 'GetAllUserWorkflows')
  async getAllUserWorkflows(
    request: WorkflowsProto.GetAllUserWorkflowsRequest,
  ) {
    this.logger.debug('Getting all user workflows');
    const workflows = await this.workflowsService.getAllUserWorkflows(
      request.user,
    );
    return { workflows };
  }

  @GrpcMethod('WorkflowsService', 'GetWorkflowById')
  async getWorkflowById(request: WorkflowsProto.GetWorkflowByIdRequest) {
    this.logger.debug(`Getting workflow by ID: ${request.workflowId}`);
    const workflow = await this.workflowsService.getWorkflowById(
      request.user,
      request.workflowId,
    );
    return { workflow };
  }

  @GrpcMethod('WorkflowsService', 'CreateWorkflow')
  async createWorkflow(request: WorkflowsProto.CreateWorkflowRequest) {
    this.logger.debug('Creating workflow');
    const createWorkflowDto: CreateWorkflowDto = {
      name: request.name,
      description: request.description,
    };
    const workflow = await this.workflowsService.createWorkflow(
      request.user,
      createWorkflowDto,
    );
    return { workflow };
  }

  @GrpcMethod('WorkflowsService', 'DeleteWorkflow')
  async deleteWorkflow(request: WorkflowsProto.DeleteWorkflowRequest) {
    this.logger.debug(`Deleting workflow: ${request.workflowId}`);
    const workflow = await this.workflowsService.deleteWorkflow(
      request.user,
      request.workflowId,
    );
    return { workflow };
  }

  @GrpcMethod('WorkflowsService', 'DuplicateWorkflow')
  async duplicateWorkflow(request: WorkflowsProto.DuplicateWorkflowRequest) {
    this.logger.debug('Duplicating workflow');
    const duplicateWorkflowDto: DuplicateWorkflowDto = {
      workflowId: request.workflowId,
      name: request.name,
      description: request.description,
    };
    const workflow = await this.workflowsService.duplicateWorkflow(
      request.user,
      duplicateWorkflowDto,
    );
    return { workflow };
  }

  @GrpcMethod('WorkflowsService', 'PublishWorkflow')
  async publishWorkflow(request: WorkflowsProto.PublishWorkflowRequest) {
    this.logger.debug('Publishing workflow');
    const publishWorkflowDto: PublishWorkflowDto = {
      workflowId: request.workflowId,
      flowDefinition: request.flowDefinition,
    };
    const workflow = await this.workflowsService.publishWorkflow(
      request.user,
      publishWorkflowDto,
    );
    return { workflow };
  }

  @GrpcMethod('WorkflowsService', 'UnpublishWorkflow')
  async unpublishWorkflow(request: WorkflowsProto.UnpublishWorkflowRequest) {
    this.logger.debug(`Unpublishing workflow: ${request.workflowId}`);
    const workflow = await this.workflowsService.unpublishWorkflow(
      request.user,
      request.workflowId,
    );
    return { workflow };
  }

  @GrpcMethod('WorkflowsService', 'RunWorkflow')
  async runWorkflow(request: WorkflowsProto.RunWorkflowRequest) {
    this.logger.debug('Running workflow');
    const runWorkflowDto: RunWorkflowDto = {
      workflowId: request.workflowId,
      flowDefinition: request.flowDefinition,
      componentId: request.componentId,
    };
    const result = await this.workflowsService.runWorkflow(
      request.user,
      runWorkflowDto,
    );
    return { url: result.url };
  }

  @GrpcMethod('WorkflowsService', 'UpdateWorkflow')
  async updateWorkflow(request: WorkflowsProto.UpdateWorkflowRequest) {
    this.logger.debug('Updating workflow');
    const updateWorkflowDto: UpdateWorkflowDto = {
      workflowId: request.workflowId,
      definition: request.definition,
    };
    const workflow = await this.workflowsService.updateWorkflow(
      request.user,
      updateWorkflowDto,
    );
    return { workflow };
  }

  @GrpcMethod('WorkflowsService', 'GetHistoricWorkflowExecutions')
  async getHistoricWorkflowExecutions(
    request: WorkflowsProto.GetHistoricRequest,
  ) {
    this.logger.debug('Getting historic workflow executions');
    const executions =
      await this.workflowsService.getHistoricWorkflowExecutions(
        request.user,
        request.workflowId,
      );
    return { executions };
  }

  @GrpcMethod('WorkflowsService', 'GetWorkflowExecutions')
  async getWorkflowExecutions(request: WorkflowsProto.GetExecutionsRequest) {
    this.logger.debug('Getting workflow executions');
    const result = await this.workflowsService.getWorkflowExecutions(
      request.user,
      request.executionId,
    );
    return {
      execution: result,
      phases: result.phases,
    };
  }

  @GrpcMethod('WorkflowsService', 'GetWorkflowPhase')
  async getWorkflowPhase(request: WorkflowsProto.GetPhaseRequest) {
    this.logger.debug('Getting workflow phase');
    const result = await this.workflowsService.getWorkflowPhase(
      request.user,
      request.phaseId,
    );
    return {
      phase: result,
      logs: result.logs,
    };
  }
}
