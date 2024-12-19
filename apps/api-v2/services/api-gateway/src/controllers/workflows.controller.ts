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
export class WorkflowsController {
  constructor(
    @Inject('WORKFLOWS_SERVICE') private readonly workflowsClient: ClientProxy,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllUserWorkflows(@CurrentUser() user: User) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.get-all', { user }),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getWorkflowById(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) workflowId: number,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.get-by-id', { user, workflowId }),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async deleteWorkflow(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) workflowId: number,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.delete', { user, workflowId }),
    );
  }

  @Post('duplicate')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async unpublishWorkflow(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) workflowId: number,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.unpublish', { user, workflowId }),
    );
  }

  @Post('run')
  @UseGuards(JwtAuthGuard)
  async runWorkflow(
    @CurrentUser() user: User,
    @Body() runWorkflowDto: RunWorkflowDto,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.run', { user, runWorkflowDto }),
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async getHistoricWorkflowExecutions(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) workflowId: number,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.historic', { user, workflowId }),
    );
  }

  @Get('executions/:id')
  @UseGuards(JwtAuthGuard)
  async getWorkflowExecutions(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) executionId: number,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.executions', { user, executionId }),
    );
  }

  @Get('phases/:id')
  @UseGuards(JwtAuthGuard)
  async getWorkflowPhase(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) phaseId: number,
  ) {
    return firstValueFrom(
      this.workflowsClient.send('workflows.phases', { user, phaseId }),
    );
  }
}
