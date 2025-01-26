import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RateLimitGuard } from '../guards/throttle.guard';
import { RedisStorage } from './memory-storage.service';
import { RateLimitStorage } from './rate-limit-storage.abstract';
import { rateLimitConfig } from './rate-limit.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [rateLimitConfig],
    }),
  ],
  providers: [
    {
      provide: RateLimitStorage,
      useClass: RedisStorage,
    },
    RateLimitGuard,
  ],
  exports: [RateLimitStorage, RateLimitGuard],
})
export class RateLimitModule {}
