// cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { REDIS_CONNECTION, RedisService } from '@microservices/redis';
import {
  CustomCacheInterceptor,
  type CachedData,
} from './custom-cache.interceptor';

@Injectable()
export class CacheService {
  constructor(
    @Inject(REDIS_CONNECTION)
    private readonly redisService: RedisService,
    private readonly cacheInterceptor: CustomCacheInterceptor,
  ) {}

  /**
   * Invalidates cache for specific routes
   * @param paths - Array of route paths to invalidate
   * @param userId - Optional user ID for user-specific cache
   */
  public async invalidateRoutes(
    paths: string[],
    userId?: string,
  ): Promise<void> {
    const client = this.redisService.getClient();

    for (const path of paths) {
      const pattern = userId
        ? `cache:*:${path}:${userId}:*`
        : `cache:*:${path}:*`;

      await this.deleteByPattern(pattern);
    }
  }

  /**
   * Invalidates cache for a specific group
   * @param group - Cache group name
   */
  public async invalidateGroup(group: string): Promise<void> {
    await this.cacheInterceptor.clearCacheGroup(group);
  }

  /**
   * Invalidates cache for multiple groups
   * @param groups - Array of cache group names
   */
  public async invalidateGroups(groups: string[]): Promise<void> {
    await Promise.all(groups.map((group) => this.invalidateGroup(group)));
  }

  /**
   * Invalidates user-specific cache
   * @param userId - User ID
   * @param groups - Optional specific groups to clear
   */
  public async invalidateUserCache(
    userId: string,
    groups?: string[],
  ): Promise<void> {
    const pattern = groups
      ? groups.map((group) => `cache:${group}:*:${userId}:*`)
      : [`cache:*:*:${userId}:*`];

    await Promise.all(pattern.map((p) => this.deleteByPattern(p)));
  }

  /**
   * Invalidates cache by pattern
   * @param pattern - Redis key pattern
   */
  private async deleteByPattern(pattern: string): Promise<void> {
    const client = this.redisService.getClient();
    let cursor = '0';

    do {
      const [nextCursor, keys] = await client.scan(cursor, {
        match: pattern,
        count: 100,
      });

      if (keys.length > 0) {
        await client.del(...keys);
      }

      cursor = nextCursor;
    } while (cursor !== '0');
  }

  /**
   * Invalidates cache older than specified time
   * @param maxAge - Maximum age in milliseconds
   */
  public async invalidateOld(maxAge: number): Promise<void> {
    const client = this.redisService.getClient();
    const now = Date.now();
    let cursor = '0';

    do {
      const [nextCursor, keys] = await client.scan(cursor, {
        match: 'cache:*',
        count: 100,
      });

      for (const key of keys) {
        const value = await client.get(key);
        if (value) {
          try {
            const cached = JSON.parse(JSON.stringify(value)) as CachedData;
            if (now - cached.timestamp > maxAge) {
              await client.del(key);
            }
          } catch (error) {
            await client.del(key); // Delete if can't parse
          }
        }
      }

      cursor = nextCursor;
    } while (cursor !== '0');
  }
}
