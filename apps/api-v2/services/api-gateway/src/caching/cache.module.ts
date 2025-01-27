import { Module } from '@nestjs/common';
import { RedisModule } from '@microservices/redis';
import { Reflector } from '@nestjs/core';
import { CacheManager } from './cache-manager.service';
import { CacheService } from './cache.service';
import { CACHE_MANAGER } from './cache.tokens';

@Module({
  imports: [RedisModule],
  providers: [
    // Add Reflector as a provider
    Reflector,
    // First provide the CacheManager
    CacheManager,
    {
      provide: CACHE_MANAGER,
      useExisting: CacheManager,
    },
    // Then the cache service that depends on it
    CacheService,
  ],
  exports: [CacheService, CacheManager],
})
export class CacheModule {}
