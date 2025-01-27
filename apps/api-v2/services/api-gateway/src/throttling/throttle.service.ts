import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CONNECTION, RedisService } from '@microservices/redis';
import type { Redis } from '@upstash/redis';
import { RateLimitInfo } from './rate-limit.interface';
import { RateLimitStorage } from './rate-limit-storage.abstract';

const RATE_LIMIT_PREFIX = 'rate_limit';

@Injectable()
export class ThrottleService extends RateLimitStorage {
  private redis: Redis;

  constructor(
    @Inject(REDIS_CONNECTION)
    private readonly redisService: RedisService,
  ) {
    super();
    try {
      this.redis = this.redisService.getClient();
      console.log('RateLimit RedisStorage initialized');
    } catch (error) {
      console.error('RateLimit RedisStorage initialization failed:', error);
      throw error;
    }
  }

  private getKey(key: string): string {
    return `${RATE_LIMIT_PREFIX}:${key}`;
  }

  public async increment(
    key: string,
    ttl: number,
    limit: number,
  ): Promise<RateLimitInfo> {
    const redisKey = this.getKey(key);

    try {
      const pipeline = this.redis.pipeline();

      pipeline.incr(redisKey);
      pipeline.ttl(redisKey);

      const [hits, currentTtl] = await pipeline.exec<[number, number]>();

      if (currentTtl === -1) {
        await this.redis.expire(redisKey, ttl);
      }

      return {
        totalHits: hits,
        remainingHits: limit - hits,
        resetsIn: currentTtl === -1 ? ttl : currentTtl,
      };
    } catch (error) {
      console.error(`Failed to increment rate limit for key ${key}:`, error);
      // Return a conservative estimate on failure
      return {
        totalHits: limit,
        remainingHits: 0,
        resetsIn: ttl,
      };
    }
  }

  public async reset(key: string): Promise<void> {
    try {
      await this.redis.del(this.getKey(key));
    } catch (error) {
      console.error(`Failed to reset rate limit for key ${key}:`, error);
    }
  }

  public async get(key: string): Promise<RateLimitInfo | null> {
    const redisKey = this.getKey(key);

    try {
      const pipeline = this.redis.pipeline();

      pipeline.get<string>(redisKey);
      pipeline.ttl(redisKey);

      const [hits, ttl] = await pipeline.exec<[string | null, number]>();

      if (!hits) return null;

      return {
        totalHits: Number(hits),
        remainingHits: 0,
        resetsIn: ttl,
      };
    } catch (error) {
      console.error(`Failed to get rate limit for key ${key}:`, error);
      return null;
    }
  }
}
