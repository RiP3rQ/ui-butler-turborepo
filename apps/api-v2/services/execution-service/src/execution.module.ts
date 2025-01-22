import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { GrpcErrorInterceptor } from '@app/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ExecutionsController } from './execution.controller';
import { ExecutionsService } from './execution.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ExecutionsController],
  providers: [
    ExecutionsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcErrorInterceptor,
    },
  ],
})
export class ExecutionsModule {}
