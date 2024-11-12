import { Module } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, JwtAuthGuard],
})
export class WorkflowsModule {}
