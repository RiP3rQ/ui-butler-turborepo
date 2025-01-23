import { GrpcErrorInterceptor } from '@microservices/common';
import { DatabaseModule } from '@microservices/database';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

@Module({
  imports: [DatabaseModule],
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
