import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GrpcErrorInterceptor } from '@app/common';
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
