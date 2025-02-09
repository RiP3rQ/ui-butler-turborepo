import { GrpcErrorInterceptor } from '@microservices/common';
import { DatabaseModule } from '@microservices/database';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        BILLING_SERVICE_HOST: Joi.string().required(),
        BILLING_SERVICE_PORT: Joi.number().required(),
      }),
    }),
  ],
  controllers: [BillingController],
  providers: [
    BillingService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcErrorInterceptor,
    },
  ],
})
export class BillingModule {}
