import { Module } from '@nestjs/common';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { WorkflowExecutionsController } from './workflow-executions.controller';

@Module({
  controllers: [WorkflowExecutionsController],
  providers: [WorkflowExecutionsService],
})
export class WorkflowExecutionsModule {}
