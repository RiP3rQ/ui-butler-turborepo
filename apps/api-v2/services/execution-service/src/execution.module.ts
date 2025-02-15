import { GrpcErrorInterceptor } from '@microservices/common';
import { DatabaseModule } from '@microservices/database';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ExecutionsController } from './execution.controller';
import { ExecutionsService } from './execution.service';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
// import { ExecutionsWorker } from './bullmq/executions.worker';
// import { ExecutionsQueueEventsListener } from '@/bullmq/executions-queue.events';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        GOOGLE_GENERATIVE_AI_API_KEY: Joi.string().required(),
        EXECUTION_SERVICE_HOST: Joi.string().required(),
        EXECUTION_SERVICE_PORT: Joi.number().required(),
        REDIS_FULL_URL: Joi.string().required(),
      }),
    }),
    // BullModule.forRoot({
    //   connection: {
    //     url: process.env.REDIS_FULL_URL,
    //   },
    //   defaultJobOptions: {
    //     attempts: 3, // 3 attempts before failing
    //     backoff: 2000, // 2 seconds delay before retry
    //     removeOnComplete: true, // remove job from queue when completed
    //     removeOnFail: 100, // keep last 100 failed jobs in queue for DEBUG purposes
    //   },
    // }),
    // BullModule.registerQueue({ name: 'executions' }),
  ],
  controllers: [ExecutionsController],
  providers: [
    ExecutionsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcErrorInterceptor,
    },
    // // BULL_MQ WORKER for processing executions
    // ExecutionsWorker,
    // // BULL_MQ WORKER additional listeners
    // ExecutionsQueueEventsListener,
  ],
})
export class ExecutionsModule {}
