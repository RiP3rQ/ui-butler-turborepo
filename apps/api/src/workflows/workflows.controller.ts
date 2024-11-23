import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { LogErrors } from '../common/error-handling/log-errors.decorator';
import type { User } from '../database/schemas/users';
import { PublishWorkflowDto } from './dto/publish-workflow.dto';
import { RunWorkflowDto } from './dto/run-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getAllUserWorkflows(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return this.workflowsService.getAllUserWorkflows(user);
  }

  @Post()
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  createWorkflow(
    @CurrentUser() user: User,
    @Body() createWorkflowDto: CreateWorkflowDto,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return this.workflowsService.createWorkflow(user, createWorkflowDto);
  }

  @Post('publish-workflow')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  publishWorkflow(
    @CurrentUser() user: User,
    @Body() publishWorkflowDto: PublishWorkflowDto,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    const { workflowId, flowDefinition } = publishWorkflowDto;

    if (!workflowId || !flowDefinition) {
      throw new BadRequestException('Invalid request');
    }

    return this.workflowsService.publishWorkflow(user, publishWorkflowDto);
  }

  @Get('unpublish-workflow')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  unpublishWorkflow(
    @CurrentUser() user: User,
    @Param('workflowId') workflowId: string,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!workflowId) {
      throw new BadRequestException('Invalid request');
    }

    return this.workflowsService.unpublishWorkflow(user, +workflowId);
  }

  @Post('run-workflow')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  runWorkflow(
    @CurrentUser() user: User,
    @Body() runWorkflowDto: RunWorkflowDto,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!runWorkflowDto.workflowId) {
      throw new BadRequestException('Invalid request');
    }

    return this.workflowsService.runWorkflow(user, runWorkflowDto);
  }

  @Patch('')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  updateWorkflow(
    @CurrentUser() user: User,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!updateWorkflowDto.workflowId) {
      throw new BadRequestException('Invalid request');
    }
    return this.workflowsService.updateWorkflow(user, updateWorkflowDto);
  }
}
