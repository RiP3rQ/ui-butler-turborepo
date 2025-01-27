import { Module } from '@nestjs/common';
import { RedisModule } from '@microservices/redis';
import { ThrottleService } from './throttle.service';
import { ThrottleGuard } from './throttle.guard';

@Module({
  imports: [RedisModule],
  providers: [ThrottleService, ThrottleGuard],
  exports: [ThrottleService, ThrottleGuard],
})
export class ThrottleModule {}
