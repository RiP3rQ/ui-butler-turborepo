import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
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
import { DuplicateWorkflowDto } from './dto/duplicate-workflow.dto';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getAllUserWorkflows(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return this.workflowsService.getAllUserWorkflows(user);
  }

  @Get('get-by-id/:workflowId')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getWorkflowById(
    @CurrentUser() user: User,
    @Param('workflowId') workflowId: string,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!workflowId || isNaN(+workflowId)) {
      throw new BadRequestException('Workflow ID is required');
    }

    return this.workflowsService.getWorkflowById(user, +workflowId);
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

  @Delete()
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  deleteWorkflow(
    @CurrentUser() user: User,
    @Query('workflowId') workflowId: string,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return this.workflowsService.deleteWorkflow(user, Number(workflowId));
  }

  @Post('duplicate-workflow')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  duplicateWorkflow(
    @CurrentUser() user: User,
    @Body() duplicateWorkflowDto: DuplicateWorkflowDto,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!duplicateWorkflowDto.workflowId) {
      throw new BadRequestException('Invalid request');
    }

    return this.workflowsService.duplicateWorkflow(user, duplicateWorkflowDto);
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

    console.log('runWorkflowDto', runWorkflowDto);

    if (!runWorkflowDto.workflowId) {
      throw new BadRequestException('Invalid request -> missing workflowId');
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

  @Get('historic')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getHistoricWorkflowExecutions(
    @CurrentUser() user: User,
    @Query('workflowId') workflowId: string,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    if (!workflowId) {
      throw new BadRequestException('Invalid request');
    }

    return this.workflowsService.getHistoricWorkflowExecutions(
      user,
      +workflowId,
    );
  }

  @Get('executions')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getWorkflowExecutions(
    @CurrentUser() user: User,
    @Query('executionId') executionId: string,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!executionId) {
      throw new BadRequestException('Invalid request');
    }

    return this.workflowsService.getWorkflowExecutions(user, +executionId);
  }

  @Get('phases')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getWorkflowPhases(
    @CurrentUser() user: User,
    @Query('phaseId') phaseId: string,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!phaseId) {
      throw new BadRequestException('Invalid request');
    }

    return this.workflowsService.getWorkflowPhase(user, +phaseId);
  }
}
