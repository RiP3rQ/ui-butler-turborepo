import { Module } from '@nestjs/common';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { WorkflowExecutionsController } from './workflow-executions.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WorkflowExecutionsController],
  providers: [WorkflowExecutionsService],
  exports: [WorkflowExecutionsService],
})
export class WorkflowExecutionsModule {}
