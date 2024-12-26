import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WorkflowsService } from './workflows.service';
import {
  CreateWorkflowDto,
  DuplicateWorkflowDto,
  PublishWorkflowDto,
  RunWorkflowDto,
  UpdateWorkflowDto,
  type User,
} from '@app/common';
import { WorkflowsProto } from '@app/proto';

@Controller()
export class WorkflowsController {
  private readonly logger = new Logger(WorkflowsController.name);

  constructor(private readonly workflowsService: WorkflowsService) {}

  private protoUserToUser(protoUser: WorkflowsProto.User): User {
    return {
      id: Number(protoUser.id),
      email: protoUser.email,
    };
  }

  @GrpcMethod('WorkflowsService', 'GetAllUserWorkflows')
  async getAllUserWorkflows(
    request: WorkflowsProto.GetAllUserWorkflowsRequest,
  ) {
    this.logger.debug('Getting all user workflows');
    const workflows = await this.workflowsService.getAllUserWorkflows(
      this.protoUserToUser(request.user),
    );
    return { workflows };
  }

  @GrpcMethod('WorkflowsService', 'GetWorkflowById')
  async getWorkflowById(request: WorkflowsProto.GetWorkflowByIdRequest) {
    this.logger.debug(`Getting workflow by ID: ${request.workflowId}`);
    const workflow = await this.workflowsService.getWorkflowById(
      this.protoUserToUser(request.user),
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
      this.protoUserToUser(request.user),
      createWorkflowDto,
    );
    return { workflow };
  }

  @GrpcMethod('WorkflowsService', 'DeleteWorkflow')
  async deleteWorkflow(request: WorkflowsProto.DeleteWorkflowRequest) {
    this.logger.debug(`Deleting workflow: ${request.workflowId}`);
    const workflow = await this.workflowsService.deleteWorkflow(
      this.protoUserToUser(request.user),
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
      this.protoUserToUser(request.user),
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
      this.protoUserToUser(request.user),
      publishWorkflowDto,
    );
    return { workflow };
  }

  @GrpcMethod('WorkflowsService', 'UnpublishWorkflow')
  async unpublishWorkflow(request: WorkflowsProto.UnpublishWorkflowRequest) {
    this.logger.debug(`Unpublishing workflow: ${request.workflowId}`);
    const workflow = await this.workflowsService.unpublishWorkflow(
      this.protoUserToUser(request.user),
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
      componentId: Number(request.componentId),
    };
    const result = await this.workflowsService.runWorkflow(
      this.protoUserToUser(request.user),
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
      this.protoUserToUser(request.user),
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
        this.protoUserToUser(request.user),
        request.workflowId,
      );
    return { executions };
  }

  @GrpcMethod('WorkflowsService', 'GetWorkflowExecutions')
  async getWorkflowExecutions(request: WorkflowsProto.GetExecutionsRequest) {
    this.logger.debug('Getting workflow executions');
    const result = await this.workflowsService.getWorkflowExecutions(
      this.protoUserToUser(request.user),
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
      this.protoUserToUser(request.user),
      request.phaseId,
    );
    return {
      phase: result,
      logs: result.logs,
    };
  }
}
