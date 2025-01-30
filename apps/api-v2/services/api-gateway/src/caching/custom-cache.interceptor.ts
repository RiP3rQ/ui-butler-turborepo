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
import { RedisService } from '@microservices/redis';
import { Request } from 'express';
import chalk from 'chalk';
import {
  CACHE_GROUP_METADATA,
  CACHE_SKIP_METADATA,
  CACHE_TTL,
  CACHE_TTL_METADATA,
} from './cache.decorator';

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
export interface CachedData<T = unknown> {
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
  private readonly isCachingDisabled: boolean =
    process.env.CACHE_DISABLED === 'true';

  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,
    @Inject(RedisService)
    private readonly redisService: RedisService,
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
    // SKIP CACHING FOR DEVELOPMENT PURPOSES
    if (this.isCachingDisabled) {
      console.log(chalk.yellow('⚠️  Cache is disabled'));
      return next.handle();
    }

    const startTime = performance.now();
    const debugInfo: DebugInfo = {
      timing: { start: startTime, end: 0, duration: 0 },
      key: '',
      hit: false,
    };

    try {
      const config = this.getCacheConfig(context);

      if (this.shouldSkipCache(context, config)) {
        this.debugLog('⏭️ Cache skipped', { config: JSON.stringify(config) });
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
          key: debugInfo.key,
          timing: `${debugInfo.timing.duration.toFixed(2)}ms`,
          metadata: cachedValue.metadata,
        });

        return of(cachedValue.data);
      }

      debugInfo.hit = false;
      this.debugLog('🔍 Cache miss', { key: cacheKey });

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
                this.debugLog('✨ Cache updated', {
                  key: cacheKey,
                  timing: `${generationTime.toFixed(2)}ms`,
                  ttl: `${String(config.ttl)}s`,
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

      this.debugLog('💾 Cache set', {
        key,
        ttl: `${String(ttl)}s`,
        size: `${(serializedValue.length / 1024).toFixed(2)}KB`,
        generationTime: metadata.generationTime
          ? metadata.generationTime.toFixed(2)
          : undefined,
      });
    } catch (error) {
      this.logError('Failed to set cached value', error);
    }
  }

  /**
   * Logs debug information in development
   * @param message - Debug message
   * @param context - Debug context
   */
  private debugLog(message: string, context?: Record<string, unknown>): void {
    if (this.isDebugMode) {
      console.log(chalk.cyan('📦 [Cache]'), chalk.white(message));

      if (context) {
        const output: Record<string, unknown> = {};

        // Format each field with appropriate color
        if ('key' in context) output.key = chalk.cyan(String(context.key));
        if ('timing' in context)
          output.timing = chalk.yellow(String(context.timing));
        if ('ttl' in context) output.ttl = chalk.blue(String(context.ttl));
        if ('size' in context) output.size = chalk.yellow(String(context.size));
        if ('metadata' in context) {
          const metadata = context.metadata as Record<string, unknown>;
          output.metadata = {
            generationTime: metadata.generationTime
              ? chalk.gray(`${String(metadata.generationTime)}ms`)
              : undefined,
            size: metadata.size
              ? chalk.yellow(`${String(metadata.size)}B`)
              : undefined,
          };
        }
        if ('config' in context) output.config = context.config;

        // Print each field on a new line with proper indentation
        console.log('{');
        Object.entries(output).forEach(([key, value]) => {
          if (key === 'metadata' && value && typeof value === 'object') {
            console.log(`  "${key}": {`);
            Object.entries(value as Record<string, unknown>).forEach(
              ([mKey, mValue]) => {
                if (mValue !== undefined) {
                  console.log(`    "${mKey}": ${String(mValue)}`);
                }
              },
            );
            console.log('  }');
          } else {
            console.log(`  "${key}": ${String(value)}`);
          }
        });
        console.log('}');
      }
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
    const formattedStack = errorStack ? `\n${chalk.gray(errorStack)}` : '';

    if (this.isDebugMode) {
      console.error(
        chalk.red('❌ [Cache Error]'),
        chalk.white(`${message}: ${errorMessage}`),
        formattedStack,
      );
    } else {
      this.logger.error(`[Cache] ${message}: ${errorMessage}`, errorStack);
    }
  }
}
