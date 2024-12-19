import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
  constructor(
    @Inject('WORKFLOWS_SERVICE') private readonly workflowsClient: ClientProxy,
  ) {}

  @Get()
  async getAllUserWorkflows(@CurrentUser() user: User) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.get-all', { user }),
    );
  }

  @Get(':id')
  async getWorkflowById(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) workflowId: number,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.get-by-id', { user, workflowId }),
    );
  }

  @Post()
  async createWorkflow(
    @CurrentUser() user: User,
    @Body() createWorkflowDto: CreateWorkflowDto,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.create', {
        user,
        createWorkflowDto,
      }),
    );
  }

  @Delete(':id')
  async deleteWorkflow(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) workflowId: number,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.delete', { user, workflowId }),
    );
  }

  @Post('duplicate')
  async duplicateWorkflow(
    @CurrentUser() user: User,
    @Body() duplicateWorkflowDto: DuplicateWorkflowDto,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.duplicate', {
        user,
        duplicateWorkflowDto,
      }),
    );
  }

  @Post(':id/publish')
  async publishWorkflow(
    @CurrentUser() user: User,
    @Body() publishWorkflowDto: PublishWorkflowDto,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.publish', {
        user,
        publishWorkflowDto,
      }),
    );
  }

  @Post(':id/unpublish')
  async unpublishWorkflow(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) workflowId: number,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.unpublish', { user, workflowId }),
    );
  }

  @Post('run')
  async runWorkflow(
    @CurrentUser() user: User,
    @Body() runWorkflowDto: RunWorkflowDto,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.run', { user, runWorkflowDto }),
    );
  }

  @Put(':id')
  async updateWorkflow(
    @CurrentUser() user: User,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.update', {
        user,
        updateWorkflowDto,
      }),
    );
  }

  @Get(':id/historic')
  async getHistoricWorkflowExecutions(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) workflowId: number,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.historic', { user, workflowId }),
    );
  }

  @Get('executions/:id')
  async getWorkflowExecutions(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) executionId: number,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.executions', { user, executionId }),
    );
  }

  @Get('phases/:id')
  async getWorkflowPhase(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) phaseId: number,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.phases', { user, phaseId }),
    );
  }
}
