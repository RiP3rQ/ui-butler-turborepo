// cache.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CONNECTION, RedisService } from '@microservices/redis';
import chalk from 'chalk';
import { type CachedData } from './custom-cache.interceptor';

@Injectable()
export class CacheService {
  constructor(
    @Inject(REDIS_CONNECTION) private readonly redisService: RedisService,
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
    console.log(
      chalk.yellow('🔄 Cache Invalidation:'),
      chalk.blue('Routes'),
      chalk.gray(`[${paths.join(', ')}]`),
      userId ? chalk.cyan(`for user: ${userId}`) : '',
    );

    for (const path of paths) {
      const pattern = userId
        ? `cache:*:${path}:${userId}:*`
        : `cache:*:${path}:*`;

      const deletedCount = await this.deleteByPattern(pattern);
      console.log(
        chalk.green('✓'),
        chalk.gray(`Cleared ${String(deletedCount)} cache entries for path:`),
        chalk.white(path),
      );
    }
  }

  /**
   * Invalidates cache for a specific group
   * @param group - Cache group name
   */
  public async invalidateGroup(group: string): Promise<void> {
    console.log(
      chalk.yellow('🔄 Cache Invalidation:'),
      chalk.blue('Group'),
      chalk.gray(group),
    );

    const pattern = `cache:${group}:*:*`;
    const deletedCount = await this.deleteByPattern(pattern);
    console.log(
      chalk.green('✓'),
      chalk.gray(`Cleared ${String(deletedCount)} cache entries from group:`),
      chalk.white(group),
    );
  }

  /**
   * Invalidates cache for multiple groups
   * @param groups - Array of cache group names
   */
  public async invalidateGroups(groups: string[]): Promise<void> {
    console.log(
      chalk.yellow('🔄 Cache Invalidation:'),
      chalk.blue('Groups'),
      chalk.gray(`[${groups.join(', ')}]`),
    );

    const results = await Promise.all(
      groups.map(async (group) => {
        const deletedCount = await this.invalidateGroup(group);
        return { group, deletedCount };
      }),
    );

    results.forEach(({ group, deletedCount }) => {
      console.log(
        chalk.green('✓'),
        chalk.gray(`Cleared ${String(deletedCount)} cache entries from group:`),
        chalk.white(group),
      );
    });
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
    console.log(
      chalk.yellow('🔄 Cache Invalidation:'),
      chalk.blue('User Cache'),
      chalk.cyan(`ID: ${userId}`),
      groups ? chalk.gray(`Groups: [${groups.join(', ')}]`) : '',
    );

    const pattern = groups
      ? groups.map((group) => `cache:${group}:*:${userId}:*`)
      : [`cache:*:*:${userId}:*`];

    const results = await Promise.all(
      pattern.map(async (p) => {
        const deletedCount = await this.deleteByPattern(p);
        return { pattern: p, deletedCount };
      }),
    );

    results.forEach(({ pattern: p, deletedCount }) => {
      console.log(
        chalk.green('✓'),
        chalk.gray(
          `Cleared ${String(deletedCount)} cache entries matching pattern:`,
        ),
        chalk.white(p),
      );
    });
  }

  /**
   * Invalidates cache by pattern
   * @param pattern - Redis key pattern
   * @returns number of deleted keys
   */
  private async deleteByPattern(pattern: string): Promise<number> {
    const client = this.redisService.getClient();
    let cursor = '0';
    let totalDeleted = 0;

    do {
      const [nextCursor, keys] = await client.scan(cursor, {
        match: pattern,
        count: 100,
      });

      if (keys.length > 0) {
        await client.del(...keys);
        totalDeleted += keys.length;
      }

      cursor = nextCursor;
    } while (cursor !== '0');

    return totalDeleted;
  }

  /**
   * Invalidates cache older than specified time
   * @param maxAge - Maximum age in milliseconds
   */
  public async invalidateOld(maxAge: number): Promise<void> {
    console.log(
      chalk.yellow('🔄 Cache Invalidation:'),
      chalk.blue('Old Cache'),
      chalk.gray(`Older than ${String(maxAge)}ms`),
    );

    const client = this.redisService.getClient();
    const now = Date.now();
    let cursor = '0';
    let totalDeleted = 0;

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
              totalDeleted++;
            }
          } catch (error: unknown) {
            console.error(
              `Error parsing cache entry: ${key} | ${JSON.stringify(error)}`,
            );
            await client.del(key); // Delete if can't parse
            totalDeleted++;
          }
        }
      }

      cursor = nextCursor;
    } while (cursor !== '0');

    console.log(
      chalk.green('✓'),
      chalk.gray(`Cleared ${String(totalDeleted)} expired cache entries`),
      chalk.white(`(older than ${String(maxAge)}ms)`),
    );
  }
}
