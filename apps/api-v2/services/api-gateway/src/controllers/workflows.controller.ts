import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
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
import { firstValueFrom } from 'rxjs';
import { WorkflowsProto } from '@app/proto';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController implements OnModuleInit {
  private workflowsService: WorkflowsProto.WorkflowsServiceClient;

  constructor(
    @Inject('WORKFLOWS_SERVICE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
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
  async getAllUserWorkflows(@CurrentUser() user: User) {
    const response = await firstValueFrom(
      this.workflowsService.getAllUserWorkflows({
        $type: 'api.workflows.GetAllUserWorkflowsRequest',
        user: this.userToProtoUser(user),
      }),
    );
    return response.workflows;
  }

  @Get('get-by-id/:workflowId')
  async getWorkflowById(
    @CurrentUser() user: User,
    @Param('workflowId', ParseIntPipe) workflowId: number,
  ) {
    const response = await firstValueFrom(
      this.workflowsService.getWorkflowById({
        $type: 'api.workflows.GetWorkflowByIdRequest',
        user: this.userToProtoUser(user),
        workflowId,
      }),
    );
    return response.workflow;
  }

  @Post()
  async createWorkflow(
    @CurrentUser() user: User,
    @Body() createWorkflowDto: CreateWorkflowDto,
  ) {
    const response = await firstValueFrom(
      this.workflowsService.createWorkflow({
        $type: 'api.workflows.CreateWorkflowRequest',
        user: this.userToProtoUser(user),
        name: createWorkflowDto.name,
        description: createWorkflowDto.description,
      }),
    );
    return response.workflow;
  }

  @Delete(':id')
  async deleteWorkflow(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) workflowId: number,
  ) {
    const response = await firstValueFrom(
      this.workflowsService.deleteWorkflow({
        $type: 'api.workflows.DeleteWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId,
      }),
    );
    return response.workflow;
  }

  @Post('duplicate')
  async duplicateWorkflow(
    @CurrentUser() user: User,
    @Body() duplicateWorkflowDto: DuplicateWorkflowDto,
  ) {
    const response = await firstValueFrom(
      this.workflowsService.duplicateWorkflow({
        $type: 'api.workflows.DuplicateWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId: duplicateWorkflowDto.workflowId,
        name: duplicateWorkflowDto.name,
        description: duplicateWorkflowDto.description,
      }),
    );
    return response.workflow;
  }

  @Post(':id/publish')
  async publishWorkflow(
    @CurrentUser() user: User,
    @Body() publishWorkflowDto: PublishWorkflowDto,
  ) {
    const response = await firstValueFrom(
      this.workflowsService.publishWorkflow({
        $type: 'api.workflows.PublishWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId: publishWorkflowDto.workflowId,
        flowDefinition: publishWorkflowDto.flowDefinition,
      }),
    );
    return response.workflow;
  }

  @Post(':id/unpublish')
  async unpublishWorkflow(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) workflowId: number,
  ) {
    const response = await firstValueFrom(
      this.workflowsService.unpublishWorkflow({
        $type: 'api.workflows.UnpublishWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId,
      }),
    );
    return response.workflow;
  }

  @Post('run-workflow')
  async runWorkflow(
    @CurrentUser() user: User,
    @Body() runWorkflowDto: RunWorkflowDto,
  ) {
    const response = await firstValueFrom(
      this.workflowsService.runWorkflow({
        $type: 'api.workflows.RunWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId: runWorkflowDto.workflowId,
        flowDefinition: runWorkflowDto.flowDefinition,
        componentId: String(runWorkflowDto.componentId),
      }),
    );
    return response;
  }

  @Put(':id')
  async updateWorkflow(
    @CurrentUser() user: User,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
  ) {
    const response = await firstValueFrom(
      this.workflowsService.updateWorkflow({
        $type: 'api.workflows.UpdateWorkflowRequest',
        user: this.userToProtoUser(user),
        workflowId: updateWorkflowDto.workflowId,
        definition: updateWorkflowDto.definition,
      }),
    );
    return response.workflow;
  }

  @Get('historic')
  async getHistoricWorkflowExecutions(
    @CurrentUser() user: User,
    @Query('workflowId', ParseIntPipe) workflowId: number,
  ) {
    const response = await firstValueFrom(
      this.workflowsService.getHistoricWorkflowExecutions({
        $type: 'api.workflows.GetHistoricRequest',
        user: this.userToProtoUser(user),
        workflowId,
      }),
    );
    return response.executions;
  }

  @Get('executions')
  async getWorkflowExecutions(
    @CurrentUser() user: User,
    @Query('executionId') executionId: string | number,
  ) {
    const response = await firstValueFrom(
      this.workflowsService.getWorkflowExecutions({
        $type: 'api.workflows.GetExecutionsRequest',
        user: this.userToProtoUser(user),
        executionId: Number(executionId),
      }),
    );
    return {
      execution: response.execution,
      phases: response.phases,
    };
  }

  @Get('phases/:id')
  async getWorkflowPhase(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) phaseId: number,
  ) {
    const response = await firstValueFrom(
      this.workflowsService.getWorkflowPhase({
        $type: 'api.workflows.GetPhaseRequest',
        user: this.userToProtoUser(user),
        phaseId,
      }),
    );
    return {
      phase: response.phase,
      logs: response.logs,
    };
  }
}
