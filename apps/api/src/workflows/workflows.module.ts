import { Module } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DatabaseModule } from '../database/database.module';
import { WorkflowExecutionsModule } from '../workflow-executions/workflow-executions.module';

@Module({
  imports: [DatabaseModule, WorkflowExecutionsModule],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, JwtAuthGuard],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
