// custom-cache.interceptor.ts
import crypto from 'node:crypto';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Redis } from '@upstash/redis';
import { Observable, of, tap } from 'rxjs';
import { Request } from 'express';
import { REDIS_CONNECTION, RedisService } from '@microservices/redis';

/** Prefix for all cache keys */
export const CUSTOM_CACHE_KEY_PREFIX = 'custom_cache';

/** Metadata key to disable caching for specific routes */
export const IGNORE_CACHE_KEY = 'ignoreCaching';

/** Default TTL in seconds (5 minutes) */
export const DEFAULT_CACHE_TTL = 300;

/** Interface for cache metrics */
interface CacheMetrics {
  key: string;
  hit: boolean;
  duration: number;
  timestamp: number;
}

/**
 * Custom cache interceptor that provides caching functionality using Redis
 */
@Injectable({ scope: Scope.REQUEST })
export class CustomCacheInterceptor implements NestInterceptor {
  private readonly redis: Redis;
  private readonly metrics: CacheMetrics[] = [];
  private readonly isCacheEnabled: boolean;

  constructor(
    @Inject(REDIS_CONNECTION)
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {
    try {
      this.redis = this.redisService.getClient();
      this.isCacheEnabled = true;
    } catch (error) {
      console.warn('Cache disabled due to Redis connection issues');
      this.isCacheEnabled = false;
    }
  }

  /**
   * Tracks cache metrics for monitoring and debugging purposes
   * @param metrics - Cache operation metrics
   */
  private readonly trackCacheMetrics = (metrics: CacheMetrics): void => {
    this.metrics.push(metrics);
    console.debug(
      `Cache ${metrics.hit ? '!_HIT_!' : 'MISS'} - Key: ${metrics.key} - Duration: ${String(metrics.duration)}ms`,
    );
  };

  /**
   * Generates a unique cache key based on the request context
   */
  private readonly generateCacheKey = (
    context: ExecutionContext,
    defaultKey?: string,
  ): string => {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { id: string } | undefined;
    const userId = user?.id ?? 'anonymous';
    const path = request.path;
    const version = process.env.API_VERSION ?? 'v1';

    // Include cache-control directives
    const cacheControl = request.headers['cache-control'];
    if (cacheControl?.includes('no-store')) {
      return '';
    }

    // Sort query params to ensure consistent cache keys
    const queryParams = { ...request.query };
    const sortedQueryString = Object.keys(queryParams)
      .sort()
      .map((key) => `${key}=${String(queryParams[key])}`)
      .join('&');

    const keyParts = [
      CUSTOM_CACHE_KEY_PREFIX,
      version,
      this.reflector.get(CACHE_GROUP_METADATA, context.getHandler()),
      defaultKey ?? path,
      request.method,
      `user:${userId}`,
      sortedQueryString && `query:${sortedQueryString}`,
      // Include relevant headers that affect caching
      request.headers['accept-language'],
      request.headers.accept,
    ].filter(Boolean);

    const key = keyParts.join(':');
    return key.length > 200
      ? `${CUSTOM_CACHE_KEY_PREFIX}:${version}:${crypto.createHash('sha256').update(key).digest('hex')}`
      : key;
  };

  /**
   * Determines if the request should be cached
   * @param context - Execution context
   * @returns Boolean indicating if caching should be applied
   */
  private readonly shouldCache = (context: ExecutionContext): boolean => {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.method !== 'GET') {
      return false;
    }

    const ignoreCaching = this.reflector.get<boolean>(
      IGNORE_CACHE_KEY,
      context.getHandler(),
    );

    return !ignoreCaching;
  };

  /**
   * Intercepts the request and handles caching logic
   * @param context - Execution context
   * @param next - Call handler
   * @returns Observable of the response
   */
  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    if (!this.isCacheEnabled || !this.shouldCache(context)) {
      return next.handle();
    }

    const startTime = Date.now();
    const key = this.generateCacheKey(
      context,
      this.reflector.get(CACHE_KEY_METADATA, context.getHandler()),
    );

    try {
      const cachedData = await this.redis.get(key);
      if (cachedData !== null) {
        this.trackCacheMetrics({
          key,
          hit: true,
          duration: Date.now() - startTime,
          timestamp: Date.now(),
        });
        return of(JSON.parse(cachedData as string));
      }

      return next.handle().pipe(
        tap((response) => {
          const ttl = Number(
            this.reflector.get(CACHE_TTL_METADATA, context.getHandler()) ??
              DEFAULT_CACHE_TTL,
          );

          void this.redis.setex(key, ttl, JSON.stringify(response)).then(() => {
            this.trackCacheMetrics({
              key,
              hit: false,
              duration: Date.now() - startTime,
              timestamp: Date.now(),
            });
          });
        }),
      );
    } catch (error) {
      console.error(`Cache error for key ${key}:`, error);
      return next.handle();
    }
  }

  /**
   * Invalidates cache entries matching a pattern
   * @param pattern - Pattern to match cache keys
   * @throws Error if cache invalidation fails
   */
  public readonly invalidateCache = async (pattern: string): Promise<void> => {
    try {
      let cursor = 0;
      const matchingKeys: string[] = [];

      do {
        const [nextCursor, keys] = await this.redis.scan(cursor, {
          match: pattern,
          count: 100,
        });
        cursor = Number(nextCursor);
        matchingKeys.push(...keys);
      } while (cursor !== 0);

      if (matchingKeys.length === 0) {
        console.debug(`No cache keys found matching pattern: ${pattern}`);
        return;
      }

      // Delete keys in batches to prevent large single operations
      const BATCH_SIZE = 100;
      for (let i = 0; i < matchingKeys.length; i += BATCH_SIZE) {
        const batch = matchingKeys.slice(i, i + BATCH_SIZE);
        await this.redis.del(...batch);
      }

      console.debug(
        `Invalidated ${String(matchingKeys.length)} cache keys matching pattern: ${pattern}`,
      );
    } catch (error) {
      const errorMessage = `Error invalidating cache pattern ${pattern}`;
      console.error(errorMessage, error);
      throw new Error(errorMessage, { cause: error });
    }
  };

  /**
   * Returns cache metrics for monitoring
   * @returns Array of cache metrics
   */
  public readonly getMetrics = (): CacheMetrics[] => {
    return [...this.metrics];
  };

  /**
   * Invalidates all cache entries for a specific group
   */
  public readonly invalidateCacheGroup = async (
    group: string,
  ): Promise<void> => {
    const pattern = `${CUSTOM_CACHE_KEY_PREFIX}:${group}:*`;
    await this.invalidateCache(pattern);
  };

  /**
   * Bulk get operation for multiple cache keys
   */
  public readonly mget = async (keys: string[]): Promise<(string | null)[]> => {
    try {
      return await this.redis.mget(...keys);
    } catch (error) {
      console.error('Bulk cache get error:', error);
      return new Array<string | null>(keys.length).fill(null);
    }
  };

  /**
   * Bulk set operation for multiple cache entries
   */
  public readonly mset = async (
    entries: { key: string; value: string; ttl: number }[],
  ): Promise<void> => {
    try {
      const pipeline = this.redis.pipeline();

      for (const { key, value, ttl } of entries) {
        pipeline.setex(key, ttl, value);
      }

      await pipeline.exec();
    } catch (error) {
      console.error('Bulk cache set error:', error);
    }
  };

  /**
   * Pre-warms cache with provided data
   */
  public readonly warmupCache = async (
    entries: { key: string; value: unknown; ttl: number }[],
  ): Promise<void> => {
    try {
      const pipeline = this.redis.pipeline();

      for (const { key, value, ttl } of entries) {
        pipeline.setex(key, ttl, JSON.stringify(value));
      }

      await pipeline.exec();
      console.debug(`Warmed up cache with ${String(entries.length)} entries`);
    } catch (error) {
      console.error('Cache warmup error:', error);
    }
  };

  /**
   * Checks cache health and connectivity
   */
  public readonly checkHealth = async (): Promise<boolean> => {
    try {
      const testKey = `${CUSTOM_CACHE_KEY_PREFIX}:health:${String(Date.now())}`;
      await this.redis.setex(testKey, 10, 'health_check');
      const value = await this.redis.get(testKey);
      await this.redis.del(testKey);
      return value === 'health_check';
    } catch (error) {
      console.error('Cache health check failed:', error);
      return false;
    }
  };
}

export const CACHE_KEY_METADATA = 'cache_module:cache_key';
export const CACHE_TTL_METADATA = 'cache_module:cache_ttl';
export const CACHE_GROUP_METADATA = 'cache_module:cache_group';
