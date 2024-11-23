import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
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
  }

  // @Delete(':id')
  // @LogErrors()
  // @UseGuards(JwtAuthGuard)
  // deleteWorkflow(@Param('id') id: string) {
  //   return this.workflowsService.deleteWorkflow(+id);
  // }
  //
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.workflowsService.findOne(+id);
  // }
  //
  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateWorkflowDto: UpdateWorkflowDto,
  // ) {
  //   return this.workflowsService.update(+id, updateWorkflowDto);
  // }
  //
}
