import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { ExecutionsController } from './execution.controller';
import { ExecutionsService } from './execution.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ExecutionsController],
  providers: [ExecutionsService],
})
export class ExecutionModule {}
