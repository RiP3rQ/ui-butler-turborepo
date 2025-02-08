import { GrpcErrorInterceptor } from '@microservices/common';
import { DatabaseModule } from '@microservices/database';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { ExecutionsController } from './execution.controller';
import { ExecutionsService } from './execution.service';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        GOOGLE_GENERATIVE_AI_API_KEY: Joi.string().required(),
        EXECUTION_SERVICE_HOST: Joi.string().required(),
        EXECUTION_SERVICE_PORT: Joi.number().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
      }),
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
      defaultJobOptions: {
        attempts: 3,
      },
    }),
    BullModule.registerQueue({ name: 'executions' }),
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
