import { Controller } from '@nestjs/common';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { WorkflowsService } from '../workflows/workflows.service';

@Controller('executions-executions')
export class WorkflowExecutionsController {
  constructor(
    private readonly workflowService: WorkflowsService,
    private readonly workflowExecutionsService: WorkflowExecutionsService,
  ) {}

  // @Get(':executionId/pending-changes')
  // async getPendingChanges(@Param('executionId') executionId: number) {
  //   const execution = await this.database.query.workflowExecutions.findFirst({
  //     where: eq(workflowExecutions.id, executionId),
  //     with: {
  //       executionPhases: true,
  //     },
  //   });
  //
  //   if (!execution) {
  //     throw new NotFoundException('Execution not found');
  //   }
  //
  //   const pendingPhase = execution.executionPhases.find(
  //     (phase) => phase.status === ExecutionPhaseStatus.PENDING,
  //   );
  //
  //   return {
  //     pendingCode: pendingPhase?.outputs?.pendingCode || '',
  //     status: execution.status,
  //   };
  // }
  //
  // @Post(':executionId/approve')
  // async approveChanges(
  //   @Param('executionId') executionId: number,
  //   @Body() body: { approved: boolean },
  // ) {
  //   const remainingPhases = await resumeWorkflowExecution(
  //     executionId,
  //     this.database,
  //     body.approved,
  //   );
  //
  //   if (body.approved && remainingPhases) {
  //     // Continue execution with remaining phases
  //     await this.workflowService.executeWorkflowPhases(
  //       executionId,
  //       remainingPhases,
  //     );
  //   }
  //
  //   return { message: body.approved ? 'Changes approved' : 'Changes rejected' };
  // }
}
