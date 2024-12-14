import { Module } from '@nestjs/common';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { WorkflowExecutionsController } from './workflow-executions.controller';
import { DatabaseModule } from '../database/database.module';
import { WorkflowsService } from '../workflows/workflows.service';

@Module({
  imports: [DatabaseModule, WorkflowsService],
  controllers: [WorkflowExecutionsController],
  providers: [WorkflowExecutionsService],
  exports: [WorkflowExecutionsService],
})
export class WorkflowExecutionsModule {}
