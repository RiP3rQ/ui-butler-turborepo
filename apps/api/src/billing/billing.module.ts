import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BillingController],
  providers: [BillingService, JwtAuthGuard],
})
export class BillingModule {}
