import {
  CreateWorkflowDto,
  CurrentUser,
  DuplicateWorkflowDto,
  JwtAuthGuard,
  PublishWorkflowDto,
  RunWorkflowDto,
  UpdateWorkflowDto,
  type User,
} from '@app/common';
import { WorkflowsProto } from '@microservices/proto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController implements OnModuleInit {
  private workflowsService: WorkflowsProto.WorkflowsServiceClient;

  constructor(
    @Inject('WORKFLOWS_SERVICE') private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
  ) {}

  public onModuleInit(): void {
    this.workflowsService =
      this.client.getService<WorkflowsProto.WorkflowsServiceClient>(
        'WorkflowsService',
      );
  }

  private userToProtoUser(user: User): WorkflowsProto.User {
    return {
      $type: 'api.workflows.User',
      id: String(user.id),
      email: user.email,
    };
  }

  @Get()
  public async getAllUserWorkflows(
    @CurrentUser() user: User,
  ): Promise<WorkflowsProto.WorkflowsResponse['workflows']> {
    const response = await this.grpcClient.call(
      this.workflowsService.getAllUserWorkflows({
        $type: 'api.workflows.GetAllUserWorkflowsRequest',
        user: this.userToProtoUser(user),
      }),
      'WorkflowsController.getAllUserWorkflows',
    );
    return response.workflows;
  }

  @Get('get-by-id/:workflowId')
  public async getWorkflowById(
    @CurrentUser() user: User,
    @Param('workflowId', ParseIntPipe) workflowId: number,
  ): Promise<WorkflowsProto.WorkflowResponse['workflow']> {
    const response = await this.grpcClient.call(
      this.workflowsService.getWorkflowById({
        $type: 'api.workflows.GetWorkflowByIdRequest',
        user: this.userToProtoUser(user),
        workflowId,
      }),
      'WorkflowsController.getWorkflowById',
    );
    return response.workflow;
  }

  @Post()
  public async createWorkflow(
    @CurrentUser() user: User,
    @Body() createWorkflowDto: CreateWorkflowDto,
  ): Promise<WorkflowsProto.WorkflowResponse['workflow']> {
    const response = await this.grpcClient.call(
      this.workflowsService.createWorkflow({
        $type: 'api.workflows.CreateWorkflowRequest',
        user: this.userToProtoUser(user),
        name: createWorkflowDto.name,
        description: createWorkflowDto.description,
      }),
      'WorkflowsController.createWorkflow',
    );
    return response.workflow;
  }

  @Delete(':id')
  public async deleteWorkflow(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) workflowId: number,
  ): Promise<WorkflowsProto.WorkflowResponse['workflow']> {
    const response = await this.grpcClient.call(
      this.workflowsService.deleteWorkflow({
        $type: 'api.workflows.DeleteWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId,
      }),
      'WorkflowsController.deleteWorkflow',
    );
    return response.workflow;
  }

  @Post('duplicate')
  public async duplicateWorkflow(
    @CurrentUser() user: User,
    @Body() duplicateWorkflowDto: DuplicateWorkflowDto,
  ): Promise<WorkflowsProto.WorkflowResponse['workflow']> {
    const response = await this.grpcClient.call(
      this.workflowsService.duplicateWorkflow({
        $type: 'api.workflows.DuplicateWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId: duplicateWorkflowDto.workflowId,
        name: duplicateWorkflowDto.name,
        description: duplicateWorkflowDto.description,
      }),
      'WorkflowsController.duplicateWorkflow',
    );
    return response.workflow;
  }

  @Post(':id/publish')
  public async publishWorkflow(
    @CurrentUser() user: User,
    @Body() publishWorkflowDto: PublishWorkflowDto,
  ): Promise<WorkflowsProto.WorkflowResponse['workflow']> {
    const response = await this.grpcClient.call(
      this.workflowsService.publishWorkflow({
        $type: 'api.workflows.PublishWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId: publishWorkflowDto.workflowId,
        flowDefinition: publishWorkflowDto.flowDefinition,
      }),
      'WorkflowsController.publishWorkflow',
    );
    return response.workflow;
  }

  @Post(':id/unpublish')
  public async unpublishWorkflow(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) workflowId: number,
  ): Promise<WorkflowsProto.WorkflowResponse['workflow']> {
    const response = await this.grpcClient.call(
      this.workflowsService.unpublishWorkflow({
        $type: 'api.workflows.UnpublishWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId,
      }),
      'WorkflowsController.unpublishWorkflow',
    );
    return response.workflow;
  }

  @Post('run-workflow')
  public async runWorkflow(
    @CurrentUser() user: User,
    @Body() runWorkflowDto: RunWorkflowDto,
  ): Promise<WorkflowsProto.RunWorkflowResponse> {
    return await this.grpcClient.call(
      this.workflowsService.runWorkflow({
        $type: 'api.workflows.RunWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId: runWorkflowDto.workflowId,
        flowDefinition: runWorkflowDto.flowDefinition ?? '',
        componentId: String(runWorkflowDto.componentId),
      }),
      'WorkflowsController.runWorkflow',
    );
  }

  @Patch('')
  public async updateWorkflow(
    @CurrentUser() user: User,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
  ): Promise<WorkflowsProto.WorkflowResponse['workflow']> {
    console.log('updateWorkflowDto', updateWorkflowDto);
    const response = await this.grpcClient.call(
      this.workflowsService.updateWorkflow({
        $type: 'api.workflows.UpdateWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId: updateWorkflowDto.workflowId,
        definition: updateWorkflowDto.definition,
      }),
      'WorkflowsController.updateWorkflow',
    );
    return response.workflow;
  }

  @Get('historic')
  public async getHistoricWorkflowExecutions(
    @CurrentUser() user: User,
    @Query('workflowId', ParseIntPipe) workflowId: number,
  ): Promise<WorkflowsProto.WorkflowExecutionsResponse['executions']> {
    const response = await this.grpcClient.call(
      this.workflowsService.getHistoricWorkflowExecutions({
        $type: 'api.workflows.GetHistoricRequest',
        user: this.userToProtoUser(user),
        workflowId,
      }),
      'WorkflowsController.getHistoricWorkflowExecutions',
    );
    return response.executions;
  }

  @Get('executions')
  public async getWorkflowExecutions(
    @CurrentUser() user: User,
    @Query('executionId') executionId: string | number,
  ): Promise<{
    execution: WorkflowsProto.WorkflowExecutionDetailResponse['execution'];
    phases: WorkflowsProto.WorkflowExecutionDetailResponse['phases'];
  }> {
    const response = await this.grpcClient.call(
      this.workflowsService.getWorkflowExecutions({
        $type: 'api.workflows.GetExecutionsRequest',
        user: this.userToProtoUser(user),
        executionId: Number(executionId),
      }),
      'WorkflowsController.getWorkflowExecutions',
    );
    return {
      execution: response.execution,
      phases: response.phases,
    };
  }

  @Get('phases/:id')
  public async getWorkflowPhase(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) phaseId: number,
  ): Promise<{
    phase: WorkflowsProto.PhaseResponse['phase'];
    logs: WorkflowsProto.PhaseResponse['logs'];
  }> {
    const response = await this.grpcClient.call(
      this.workflowsService.getWorkflowPhase({
        $type: 'api.workflows.GetPhaseRequest',
        user: this.userToProtoUser(user),
        phaseId,
      }),
      'WorkflowsController.getWorkflowPhase',
    );
    return {
      phase: response.phase,
      logs: response.logs,
    };
  }
}
