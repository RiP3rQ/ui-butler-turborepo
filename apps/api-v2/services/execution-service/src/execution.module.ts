import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { ExecutionsController } from './execution.controller';
import { ExecutionsService } from './execution.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GrpcErrorInterceptor } from '@app/common';

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
