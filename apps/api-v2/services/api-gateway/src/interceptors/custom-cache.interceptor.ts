// custom-cache.interceptor.ts

import {
  CACHE_KEY_METADATA,
  CACHE_MANAGER,
  CACHE_TTL_METADATA,
} from '@nestjs/cache-manager';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Inject,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Cache } from 'cache-manager';
import { Observable, of, tap } from 'rxjs';
import { Request } from 'express';

/** Prefix for all cache keys */
export const CUSTOM_CACHE_KEY_PREFIX = 'custom_cache';

/** Metadata key to disable caching for specific routes */
export const IGNORE_CACHE_KEY = 'ignoreCaching';

/** Default TTL in milliseconds (5 minutes) */
export const DEFAULT_CACHE_TTL = 300000;

/** Interface for cache metrics */
interface CacheMetrics {
  key: string;
  hit: boolean;
  duration: number;
  timestamp: number;
}

/**
 * Custom cache interceptor that provides caching functionality for HTTP requests
 * with support for user-specific caching and query parameters
 */
@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  /** Internal metrics storage */
  private readonly metrics: CacheMetrics[] = [];

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Tracks cache metrics for monitoring and debugging purposes
   * @param metrics - Cache operation metrics
   */
  private trackCacheMetrics(metrics: CacheMetrics): void {
    this.metrics.push(metrics);
    console.debug(
      `Cache ${metrics.hit ? '!_HIT_!' : 'MISS'} - Key: ${metrics.key} - Duration: ${String(metrics.duration)}ms`,
    );
  }

  /**
   * Generates a unique cache key based on the request context
   * @param context - Execution context
   * @param defaultKey - Optional override key
   * @returns Generated cache key
   */
  private generateCacheKey(
    context: ExecutionContext,
    defaultKey?: string,
  ): string {
    const request = context.switchToHttp().getRequest<Request>();
    // @ts-expect-error --- We get proper values from the request
    const userId = String(request.user?.id ?? 'anonymous');
    const path = request.path;
    const queryString = new URLSearchParams(
      request.query as Record<string, string>,
    ).toString();

    const keyParts = [
      CUSTOM_CACHE_KEY_PREFIX,
      defaultKey ?? path,
      `user:${userId}`,
      queryString && `query:${queryString}`,
    ].filter(Boolean);

    return keyParts.join(':');
  }

  /**
   * Determines if the request should be cached
   * @param context - Execution context
   * @returns Boolean indicating if caching should be applied
   */
  private shouldCache(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.method !== 'GET') {
      return false;
    }

    const ignoreCaching = this.reflector.get<boolean>(
      IGNORE_CACHE_KEY,
      context.getHandler(),
    );

    return !ignoreCaching;
  }

  /**
   * Matches a string against a glob-like pattern
   * @param str - String to match
   * @param pattern - Pattern to match against
   * @returns Boolean indicating if string matches pattern
   */
  private matchesPattern(str: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\[!/g, '[^')
      .replace(/\[/g, '[')
      .replace(/\]/g, ']')
      .replace(/\./g, '\\.');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(str);
  }

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
    if (!this.shouldCache(context)) {
      return next.handle();
    }

    const startTime = Date.now();
    const key = this.generateCacheKey(
      context,
      this.reflector.get(CACHE_KEY_METADATA, context.getHandler()),
    );

    try {
      const cachedData = await this.cacheManager.get(key);
      if (cachedData !== undefined) {
        this.trackCacheMetrics({
          key,
          hit: true,
          duration: Date.now() - startTime,
          timestamp: Date.now(),
        });
        return of(cachedData);
      }

      return next.handle().pipe(
        tap((response) => {
          const ttl = Number(
            this.reflector.get(CACHE_TTL_METADATA, context.getHandler()) ??
              DEFAULT_CACHE_TTL,
          );

          void this.cacheManager.set(key, response, ttl).then(() => {
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
  public async invalidateCache(pattern: string): Promise<void> {
    try {
      const store = this.cacheManager.store;
      const allKeys = await store.keys();

      const matchingKeys = allKeys.filter((key) =>
        this.matchesPattern(key, pattern),
      );

      if (matchingKeys.length === 0) {
        console.debug(`No cache keys found matching pattern: ${pattern}`);
        return;
      }

      console.debug(
        `Found ${String(matchingKeys.length)} keys matching pattern: ${pattern}`,
      );
      console.debug('Matching keys:', matchingKeys);

      await Promise.all(matchingKeys.map((key) => this.cacheManager.del(key)));
      console.debug(
        `Invalidated ${String(matchingKeys.length)} cache keys matching pattern: ${pattern}`,
      );
    } catch (error) {
      const errorMessage = `Error invalidating cache pattern ${pattern}`;
      console.error(errorMessage, error);
      throw new Error(errorMessage, { cause: error });
    }
  }

  /**
   * Returns cache metrics for monitoring
   * @returns Array of cache metrics
   */
  public getMetrics(): CacheMetrics[] {
    return [...this.metrics];
  }
}
