import {
  CreateWorkflowDto,
  DuplicateWorkflowDto,
  PublishWorkflowDto,
  RunWorkflowDto,
  UpdateWorkflowDto,
  type User,
} from '@microservices/common';
import { WorkflowsProto } from '@microservices/proto';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WorkflowsService } from './workflows.service';

@Controller()
export class WorkflowsController {
  private readonly logger = new Logger(WorkflowsController.name);

  constructor(private readonly workflowsService: WorkflowsService) {}

  private protoUserToUser(protoUser: WorkflowsProto.User | undefined): User {
    if (!protoUser) {
      throw new Error('User is required');
    }
    return {
      id: Number(protoUser.id),
      email: protoUser.email,
    };
  }

  @GrpcMethod('WorkflowsService', 'GetAllUserWorkflows')
  public async getAllUserWorkflows(
    request: WorkflowsProto.GetAllUserWorkflowsRequest,
  ): Promise<WorkflowsProto.WorkflowsResponse> {
    if (!request.user) {
      throw new Error('User is required');
    }

    this.logger.debug('Getting all user workflows');
    return await this.workflowsService.getAllUserWorkflows(
      this.protoUserToUser(request.user),
    );
  }

  @GrpcMethod('WorkflowsService', 'GetWorkflowById')
  public async getWorkflowById(
    request: WorkflowsProto.GetWorkflowByIdRequest,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    this.logger.debug(`Getting workflow by ID: ${String(request.workflowId)}`);
    return await this.workflowsService.getWorkflowById(
      this.protoUserToUser(request.user),
      request.workflowId,
    );
  }

  @GrpcMethod('WorkflowsService', 'CreateWorkflow')
  public async createWorkflow(
    request: WorkflowsProto.CreateWorkflowRequest,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    this.logger.debug('Creating workflow');
    const createWorkflowDto: CreateWorkflowDto = {
      name: request.name,
      description: request.description,
    };
    return await this.workflowsService.createWorkflow(
      this.protoUserToUser(request.user),
      createWorkflowDto,
    );
  }

  @GrpcMethod('WorkflowsService', 'DeleteWorkflow')
  public async deleteWorkflow(
    request: WorkflowsProto.DeleteWorkflowRequest,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    this.logger.debug(`Deleting workflow: ${String(request.workflowId)}`);
    return await this.workflowsService.deleteWorkflow(
      this.protoUserToUser(request.user),
      request.workflowId,
    );
  }

  @GrpcMethod('WorkflowsService', 'DuplicateWorkflow')
  public async duplicateWorkflow(
    request: WorkflowsProto.DuplicateWorkflowRequest,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    this.logger.debug('Duplicating workflow');
    const duplicateWorkflowDto: DuplicateWorkflowDto = {
      workflowId: request.workflowId,
      name: request.name,
      description: request.description,
    };
    return await this.workflowsService.duplicateWorkflow(
      this.protoUserToUser(request.user),
      duplicateWorkflowDto,
    );
  }

  @GrpcMethod('WorkflowsService', 'PublishWorkflow')
  public async publishWorkflow(
    request: WorkflowsProto.PublishWorkflowRequest,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    this.logger.debug('Publishing workflow');
    const publishWorkflowDto: PublishWorkflowDto = {
      workflowId: request.workflowId,
      flowDefinition: request.flowDefinition,
    };
    return await this.workflowsService.publishWorkflow(
      this.protoUserToUser(request.user),
      publishWorkflowDto,
    );
  }

  @GrpcMethod('WorkflowsService', 'UnpublishWorkflow')
  public async unpublishWorkflow(
    request: WorkflowsProto.UnpublishWorkflowRequest,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    this.logger.debug(`Unpublishing workflow: ${String(request.workflowId)}`);
    return await this.workflowsService.unpublishWorkflow(
      this.protoUserToUser(request.user),
      request.workflowId,
    );
  }

  @GrpcMethod('WorkflowsService', 'RunWorkflow')
  public async runWorkflow(
    request: WorkflowsProto.RunWorkflowRequest,
  ): Promise<WorkflowsProto.RunWorkflowResponse> {
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
    return {
      $type: 'api.workflows.RunWorkflowResponse',
      url: result.url,
    };
  }

  @GrpcMethod('WorkflowsService', 'UpdateWorkflow')
  public async updateWorkflow(
    request: WorkflowsProto.UpdateWorkflowRequest,
  ): Promise<WorkflowsProto.WorkflowResponse> {
    this.logger.debug('Updating workflow');
    const updateWorkflowDto: UpdateWorkflowDto = {
      workflowId: request.workflowId,
      definition: request.definition,
    };
    return await this.workflowsService.updateWorkflow(
      this.protoUserToUser(request.user),
      updateWorkflowDto,
    );
  }

  @GrpcMethod('WorkflowsService', 'GetHistoricWorkflowExecutions')
  public async getHistoricWorkflowExecutions(
    request: WorkflowsProto.GetHistoricRequest,
  ): Promise<WorkflowsProto.WorkflowExecutionsResponse> {
    this.logger.debug('Getting historic workflow executions');
    const executions =
      await this.workflowsService.getHistoricWorkflowExecutions(
        this.protoUserToUser(request.user),
        request.workflowId,
      );
    return {
      $type: 'api.workflows.WorkflowExecutionsResponse',
      executions: executions.executions,
    };
  }

  @GrpcMethod('WorkflowsService', 'GetWorkflowExecutions')
  public async getWorkflowExecutions(
    request: WorkflowsProto.GetExecutionsRequest,
  ): Promise<WorkflowsProto.WorkflowExecutionDetailResponse> {
    this.logger.debug('Getting workflow executions');
    return await this.workflowsService.getWorkflowExecutions(
      this.protoUserToUser(request.user),
      request.executionId,
    );
  }

  @GrpcMethod('WorkflowsService', 'GetWorkflowPhase')
  public async getWorkflowPhase(
    request: WorkflowsProto.GetPhaseRequest,
  ): Promise<WorkflowsProto.PhaseResponse> {
    this.logger.debug('Getting workflow phase');
    return await this.workflowsService.getWorkflowPhase(
      this.protoUserToUser(request.user),
      request.phaseId,
    );
  }
}
