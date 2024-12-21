import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApproveChangesDto,
  CurrentUser,
  JwtAuthGuard,
  type User,
} from '@app/common';
import { firstValueFrom } from 'rxjs';

@Controller('executions')
@UseGuards(JwtAuthGuard)
export class ExecutionsController {
  constructor(
    @Inject('EXECUTIONS_SERVICE')
    private readonly executionsClient: ClientProxy,
  ) {}

  @Get(':executionId/pending-changes')
  async getPendingChanges(
    @CurrentUser() user: User,
    @Param('executionId', ParseIntPipe) executionId: number,
  ) {
    console.log('executionId', executionId);
    return firstValueFrom(
      this.executionsClient.send('executions.pending-changes', {
        user,
        executionId,
      }),
    );
  }

  @Post(':executionId/approve')
  async approveChanges(
    @CurrentUser() user: User,
    @Param('executionId', ParseIntPipe) executionId: number,
    @Body() body: ApproveChangesDto,
  ) {
    return firstValueFrom(
      this.executionsClient.send('executions.approve', {
        user,
        executionId,
        body,
      }),
    );
  }
}
