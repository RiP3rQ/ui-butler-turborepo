// custom-cache.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { REDIS_CONNECTION, RedisService } from '@microservices/redis';
import { Request } from 'express';

/** Cache metadata keys */
export const CACHE_TTL_METADATA = 'cache_ttl';
export const CACHE_GROUP_METADATA = 'cache_group';
export const CACHE_SKIP_METADATA = 'cache_skip';

/** Cache TTL options in seconds */
export const CACHE_TTL = {
  DEFAULT: 60,
  ONE_MINUTE: 60,
  FIVE_MINUTES: 300,
  FIFTEEN_MINUTES: 900,
  ONE_HOUR: 3600,
} as const;

type CacheTTLValues = (typeof CACHE_TTL)[keyof typeof CACHE_TTL];

/** Cache configuration interface */
interface CacheConfig {
  /** Time-to-live in seconds */
  ttl: CacheTTLValues;
  /** Cache group identifier */
  group: string;
  /** Flag to skip cache */
  skip: boolean;
}

/** Cached data structure */
interface CachedData<T = unknown> {
  /** Timestamp when the data was cached */
  timestamp: number;
  /** The cached data */
  data: T;
  /** Cache metadata */
  metadata: {
    /** Time taken to generate the data */
    generationTime?: number;
    /** Size of the cached data in bytes */
    size?: number;
  };
}

/** Debug information interface */
interface DebugInfo {
  /** Cache key */
  key: string;
  /** Operation timing */
  timing: {
    start: number;
    end: number;
    duration: number;
  };
  /** Cache hit/miss status */
  hit: boolean;
  /** Additional context */
  context?: Record<string, unknown>;
}

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CustomCacheInterceptor.name);
  private readonly isDebugMode: boolean = process.env.NODE_ENV !== 'production';

  constructor(
    @Inject(REDIS_CONNECTION)
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {
    this.debugLog('Cache interceptor initialized', { debug: this.isDebugMode });
  }

  /**
   * Intercepts requests and handles caching logic
   * @param context - Execution context
   * @param next - Call handler
   * @returns Observable of the response
   */
  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const startTime = performance.now();
    const debugInfo: DebugInfo = {
      timing: { start: startTime, end: 0, duration: 0 },
      key: '',
      hit: false,
    };

    try {
      const config = this.getCacheConfig(context);

      if (this.shouldSkipCache(context, config)) {
        this.debugLog('Cache skipped', { config });
        return next.handle();
      }

      const cacheKey = await this.buildCacheKey(context, config);
      debugInfo.key = cacheKey;

      const cachedValue = await this.getCachedValue(cacheKey);

      if (cachedValue !== null) {
        const endTime = performance.now();
        debugInfo.timing.end = endTime;
        debugInfo.timing.duration = endTime - startTime;
        debugInfo.hit = true;

        this.debugLog('🎯 Cache hit', {
          ...debugInfo,
          timing: `${debugInfo.timing.duration.toFixed(2)}ms`,
          metadata: cachedValue.metadata,
        });

        return of(cachedValue.data);
      }

      debugInfo.hit = false;
      this.debugLog('❌ Cache miss', { key: cacheKey });

      return next.handle().pipe(
        tap({
          next: (response: unknown) => {
            const endTime = performance.now();
            const generationTime = endTime - startTime;

            // That's on purpose, we don't want to wait for the cache to be set
            void this.setCachedValue(cacheKey, response, config.ttl, {
              generationTime,
            })
              .then(() => {
                this.debugLog('🔄 Cache updated', {
                  key: cacheKey,
                  timing: `${generationTime.toFixed(2)}ms`,
                });
              })
              .catch((error: unknown) => {
                this.logError('Failed to set cached value', error);
              });
          },
          error: (error: Error) => {
            this.logError('Pipeline error', error);
          },
        }),
      );
    } catch (error) {
      this.logError('Cache operation failed', error);
      return next.handle();
    }
  }

  /**
   * Gets cache configuration from metadata
   * @param context - Execution context
   * @returns Cache configuration
   */
  private getCacheConfig(context: ExecutionContext): CacheConfig {
    return {
      ttl:
        this.reflector.get<CacheTTLValues | undefined>(
          CACHE_TTL_METADATA,
          context.getHandler(),
        ) ?? CACHE_TTL.DEFAULT,
      group:
        this.reflector.getAllAndOverride<string | undefined>(
          CACHE_GROUP_METADATA,
          [context.getHandler(), context.getClass()],
        ) ?? 'default',
      skip:
        this.reflector.get<boolean | undefined>(
          CACHE_SKIP_METADATA,
          context.getHandler(),
        ) ?? false,
    };
  }

  /**
   * Determines if caching should be skipped
   * @param context - Execution context
   * @param config - Cache configuration
   * @returns Boolean indicating if cache should be skipped
   */
  private shouldSkipCache(
    context: ExecutionContext,
    config: CacheConfig,
  ): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const cacheControl = request.headers['cache-control'];

    return (
      config.skip ||
      request.method !== 'GET' ||
      Boolean(cacheControl?.includes('no-cache')) ||
      Boolean(cacheControl?.includes('no-store'))
    );
  }

  /**
   * Builds a cache key from the request context
   * @param context - Execution context
   * @param config - Cache configuration
   * @returns Cache key string
   */
  // eslint-disable-next-line @typescript-eslint/require-await --- ESlint don't trip
  private async buildCacheKey(
    context: ExecutionContext,
    config: CacheConfig,
  ): Promise<string> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { id: string } | undefined;

    const keyParts = [
      'cache',
      config.group,
      request.path,
      user?.id ?? 'anonymous',
      this.hashQueryParams(request.query),
    ];

    return keyParts.join(':');
  }

  /**
   * Creates a hash of query parameters
   * @param query - Query parameters
   * @returns Hashed query string
   */
  private hashQueryParams(query: Record<string, unknown>): string {
    const sortedQuery = Object.keys(query)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = query[key];
        return acc;
      }, {});

    return Buffer.from(JSON.stringify(sortedQuery)).toString('base64');
  }

  /**
   * Retrieves a value from cache
   * @param key - Cache key
   * @returns Cached value or null
   */
  private async getCachedValue(key: string): Promise<CachedData | null> {
    try {
      const client = this.redisService.getClient();
      const value = await client.get(key);

      if (!value) {
        return null;
      }

      return JSON.parse(JSON.stringify(value)) as CachedData;
    } catch (error) {
      this.logError('Failed to get cached value', error);
      return null;
    }
  }

  /**
   * Sets a value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time-to-live in seconds
   * @param metadata - Optional metadata
   */
  private async setCachedValue(
    key: string,
    value: unknown,
    ttl: number,
    metadata: { generationTime?: number } = {},
  ): Promise<void> {
    try {
      const client = this.redisService.getClient();
      const serializedValue = JSON.stringify(value);

      const cacheData: CachedData = {
        timestamp: Date.now(),
        data: value,
        metadata: {
          generationTime: metadata.generationTime,
          size: serializedValue.length,
        },
      };

      await client.setex(key, ttl, JSON.stringify(cacheData));

      this.debugLog('Cache set', {
        key,
        ttl,
        size: `${(serializedValue.length / 1024).toFixed(2)}KB`,
        generationTime: metadata.generationTime
          ? `${metadata.generationTime.toFixed(2)}ms`
          : undefined,
      });
    } catch (error) {
      this.logError('Failed to set cached value', error);
    }
  }

  /**
   * Clears all cache entries for a group
   * @param group - Cache group to clear
   */
  public async clearCacheGroup(group: string): Promise<void> {
    const startTime = performance.now();
    try {
      const client = this.redisService.getClient();
      const pattern = `cache:${group}:*`;
      let cursor = '0';
      let totalCleared = 0;

      do {
        const [nextCursor, keys] = await client.scan(cursor, {
          match: pattern,
          count: 100,
        });

        if (keys.length > 0) {
          await client.del(...keys);
          totalCleared += keys.length;
          this.debugLog('🗑️ Cleared cache keys', {
            group,
            count: keys.length,
            keys,
          });
        }

        cursor = nextCursor;
      } while (cursor !== '0');

      const duration = performance.now() - startTime;
      this.debugLog(`🧹 Cache group cleared`, {
        group,
        totalCleared,
        duration: `${duration.toFixed(2)}ms`,
      });
    } catch (error) {
      this.logError(`Failed to clear cache group: ${group}`, error);
      throw error;
    }
  }

  /**
   * Logs debug information in development
   * @param message - Debug message
   * @param context - Debug context
   */
  private debugLog(message: string, context?: Record<string, unknown>): void {
    if (this.isDebugMode) {
      console.log(
        `\x1b[36m[Cache]\x1b[0m ${message}`,
        context ? JSON.stringify(context, null, 2) : '',
      );
    }
  }

  /**
   * Logs errors
   * @param message - Error message
   * @param error - Error object
   */
  private logError(message: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    if (this.isDebugMode) {
      console.error(
        `\x1b[31m[Cache Error]\x1b[0m ${message}: ${errorMessage}`,
        errorStack,
      );
    } else {
      this.logger.error(`[Cache] ${message}: ${errorMessage}`, errorStack);
    }
  }
}
