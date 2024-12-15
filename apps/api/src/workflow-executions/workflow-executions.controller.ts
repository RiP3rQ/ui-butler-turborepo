import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { LogErrors } from '../common/error-handling/log-errors.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { User } from '../database/schemas/users';
import { ApproveChangesDto } from './dto/approve-changes.dto';

@Controller('executions-executions')
export class WorkflowExecutionsController {
  constructor(
    private readonly workflowExecutionsService: WorkflowExecutionsService,
  ) {}

  @Get(':executionId/pending-changes')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getPendingChanges(
    @CurrentUser() user: User,
    @Param('executionId') executionId: number,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return this.workflowExecutionsService.getPendingChanges(user, executionId);
  }

  @Post(':executionId/approve')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  approveChanges(
    @CurrentUser() user: User,
    @Param('executionId') executionId: string,
    @Body() body: ApproveChangesDto,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!executionId) {
      throw new NotFoundException('Execution not found');
    }

    if (!body) {
      throw new NotFoundException('Body not found');
    }

    return this.workflowExecutionsService.approveChanges(
      user,
      Number(executionId),
      body,
    );
  }
}
