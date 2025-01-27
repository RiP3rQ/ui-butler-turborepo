import { Module } from '@nestjs/common';
import { RedisModule } from '@microservices/redis';
import { CacheService } from './cache.service';

@Module({
  imports: [RedisModule],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
