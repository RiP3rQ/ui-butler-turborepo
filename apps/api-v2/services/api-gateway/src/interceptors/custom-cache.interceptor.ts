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
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Cache } from 'cache-manager';
import { Observable, of, tap } from 'rxjs';
import { type Request } from 'express';

export const CUSTOM_CACHE_KEY_PREFIX = 'custom_cache';
export const IGNORE_CACHE_KEY = 'ignoreCaching';

@Injectable()
export class CustomCacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  private trackCacheMetrics(
    cacheKey: string,
    isCacheHit: boolean,
    duration: number,
  ): void {
    console.log(
      `Cache ${isCacheHit ? 'HIT' : 'MISS'} - Key: ${cacheKey} - Duration: ${duration}ms`,
    );
    // Here you could also send metrics to your monitoring system
  }

  private generateCacheKey(
    context: ExecutionContext,
    defaultKey?: string,
  ): string {
    const request = context.switchToHttp().getRequest<Request>();
    // @ts-ignore
    const userId = request.user?.id ?? request.user?.id ?? '';
    const path = request.path;
    const queryString = new URLSearchParams(
      request.query as Record<string, string>,
    ).toString();

    return [
      CUSTOM_CACHE_KEY_PREFIX,
      defaultKey ?? path,
      userId ? `user:${String(userId)}` : 'anonymous',
      queryString ? `query:${queryString}` : '',
    ]
      .filter(Boolean)
      .join(':');
  }

  private shouldCache(context: ExecutionContext): boolean {
    // Don't cache non-GET requests
    if (context.switchToHttp().getRequest().method !== 'GET') {
      return false;
    }

    // Check if caching is explicitly disabled
    const ignoreCaching = this.reflector.get<boolean>(
      IGNORE_CACHE_KEY,
      context.getHandler(),
    );

    return !ignoreCaching;
  }

  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
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
      if (cachedData) {
        this.trackCacheMetrics(key, true, Date.now() - startTime);
        return of(cachedData);
      }

      return next.handle().pipe(
        tap(async (response) => {
          const ttl =
            this.reflector.get(CACHE_TTL_METADATA, context.getHandler()) ??
            300000; // 5 minutes default

          await this.cacheManager.set(key, response, ttl);
          this.trackCacheMetrics(key, false, Date.now() - startTime);
        }),
      );
    } catch (error) {
      console.error(`Cache error for key ${key}:`, error);
      return next.handle();
    }
  }

  /**
   * Invalidates cache entries matching a pattern
   */
  public async invalidateCache(pattern: string): Promise<void> {
    try {
      const keys = await this.cacheManager.store.keys(pattern);
      console.log('keys', keys);
      await Promise.all(keys.map((key) => this.cacheManager.del(key)));
      console.log(`Invalidated cache keys matching pattern: ${pattern}`);
    } catch (error) {
      console.error(`Error invalidating cache pattern ${pattern}:`, error);
    }
  }
}
