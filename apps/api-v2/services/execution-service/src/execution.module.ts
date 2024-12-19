import { Module } from '@nestjs/common';
import { ExecutionsController } from './execution.controller';
import { ExecutionsService } from './execution.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  controllers: [ExecutionsController],
  providers: [ExecutionsService],
})
export class ExecutionsModule {}
