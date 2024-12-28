// src/interceptors/cache.interceptor.ts
import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';
import { PerformanceMetrics } from '../metrics/performance.metrics';

// Define cache key metadata constant
export const CACHE_KEY_METADATA = 'cache_key_metadata';

@Injectable()
export class CustomCacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly performanceMetrics: PerformanceMetrics,
  ) {}

  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { httpAdapter } = this.httpAdapterHost;

    // Skip caching for non-GET requests
    if (httpAdapter.getRequestMethod(request) !== 'GET') {
      return undefined;
    }

    // Skip caching for specific paths
    const excludePaths = ['/health', '/metrics'];
    const requestUrl = httpAdapter.getRequestUrl(request);
    if (excludePaths.some((path) => requestUrl.includes(path))) {
      return undefined;
    }

    // Use custom cache key if provided
    const cacheKey = Reflect.getMetadata(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    if (cacheKey) {
      return `${cacheKey}-${JSON.stringify(request.query)}`;
    }

    // Default cache key
    return `${requestUrl}-${JSON.stringify(request.query)}`;
  }

  async intercept(
    context: ExecutionContext,
    next: CallableFunction,
  ): Promise<Observable<any>> {
    const key = this.trackBy(context);

    if (!key) {
      return next();
    }

    try {
      const value = await this.cacheManager.get(key);

      if (value) {
        this.performanceMetrics.incrementCacheHits('http');
        return of(value);
      }

      this.performanceMetrics.incrementCacheMisses('http');

      return next().pipe(
        tap((response) => {
          this.cacheManager.set(key, response);
        }),
      );
    } catch (err) {
      console.error('Error caching response', err);
      return next();
    }
  }
}
