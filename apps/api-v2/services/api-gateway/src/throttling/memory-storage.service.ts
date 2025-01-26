import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';
import { RateLimitInfo } from './rate-limit.interface';
import { RateLimitStorage } from './rate-limit-storage.abstract';

@Injectable()
export class RedisStorage implements RateLimitStorage {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    const url = String(this.configService.getOrThrow('REDIS_URL'));
    const token = String(this.configService.getOrThrow('REDIS_TOKEN'));

    this.redis = new Redis({
      url,
      token,
    });
  }

  /**
   * Increments the hit count for a given key and returns the rate limit information
   * @param {string} key - The key to increment the hit count for
   * @param {number} ttl - The time to live in seconds
   * @param {number} limit - The rate limit for the key
   * @returns {Promise<RateLimitInfo>} The rate limit information
   */
  public async increment(
    key: string,
    ttl: number,
    limit: number,
  ): Promise<RateLimitInfo> {
    const pipeline = this.redis.pipeline();

    pipeline.incr(key);
    pipeline.ttl(key);

    const [hits, currentTtl] = await pipeline.exec<[number, number]>();

    if (currentTtl === -1) {
      await this.redis.expire(key, ttl);
    }

    return {
      totalHits: hits,
      remainingHits: limit - hits,
      resetsIn: currentTtl === -1 ? ttl : currentTtl,
    };
  }

  /**
   * Resets the hit count for a given key
   * @param {string} key - The key to reset the hit count for
   */
  public async reset(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Retrieves the rate limit information for a given key
   * @param {string} key - The key to retrieve the rate limit information for
   * @returns {Promise<RateLimitInfo | null>} The rate limit information or null if the key is not found
   */
  public async get(key: string): Promise<RateLimitInfo | null> {
    const pipeline = this.redis.pipeline();

    pipeline.get<string>(key);
    pipeline.ttl(key);

    const [hits, ttl] = await pipeline.exec<[string | null, number]>();

    if (!hits) return null;

    return {
      totalHits: Number(hits),
      remainingHits: 0,
      resetsIn: ttl,
    };
  }
}
