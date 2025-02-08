import { GrpcErrorInterceptor } from '@microservices/common';
import { DatabaseModule } from '@microservices/database';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { ExecutionsController } from './execution.controller';
import { ExecutionsService } from './execution.service';

@Module({
  imports: [
    DatabaseModule,
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
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
