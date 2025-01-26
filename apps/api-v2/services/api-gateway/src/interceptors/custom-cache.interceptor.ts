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

export const CACHE_TTL_METADATA = 'cache_ttl';
export const CACHE_GROUP_METADATA = 'cache_group';
export const CACHE_SKIP_METADATA = 'cache_skip';

export const CACHE_TTL = {
  DEFAULT: 60,
  ONE_MINUTE: 60,
  FIVE_MINUTES: 300,
  FIFTEEN_MINUTES: 900,
  ONE_HOUR: 3600,
} as const;

interface CacheConfig {
  ttl: number;
  group: string;
  skip: boolean;
}

interface CachedData<T = unknown> {
  timestamp: number;
  data: T;
}

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CustomCacheInterceptor.name);
  private readonly debug = process.env.NODE_ENV !== 'production';

  constructor(
    @Inject(REDIS_CONNECTION)
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {
    this.logger.log('Cache interceptor initialized');
  }

  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    try {
      const config = this.getCacheConfig(context);

      if (this.shouldSkipCache(context, config)) {
        this.logDebug('Skipping cache');
        return next.handle();
      }

      const cacheKey = await this.buildCacheKey(context, config);
      const cachedValue = await this.getCachedValue(cacheKey);

      if (cachedValue !== null) {
        this.logDebug('Cache hit', { key: cacheKey });
        return of(cachedValue);
      }

      return next.handle().pipe(
        tap({
          next: async (response: unknown) => {
            await this.setCachedValue(cacheKey, response, config.ttl);
          },
          error: (error: Error) => {
            this.logError('Error in interceptor pipe', error);
          },
        }),
      );
    } catch (error) {
      this.logError('Cache operation failed', error);
      return next.handle();
    }
  }

  private getCacheConfig(context: ExecutionContext): CacheConfig {
    return {
      ttl:
        this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler()) ??
        CACHE_TTL.DEFAULT,
      group:
        this.reflector.getAllAndOverride<string>(CACHE_GROUP_METADATA, [
          context.getHandler(),
          context.getClass(),
        ]) ?? 'default',
      skip:
        this.reflector.get<boolean>(
          CACHE_SKIP_METADATA,
          context.getHandler(),
        ) ?? false,
    };
  }

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

  private hashQueryParams(query: Record<string, unknown>): string {
    const sortedQuery = Object.keys(query)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = query[key];
        return acc;
      }, {});

    return Buffer.from(JSON.stringify(sortedQuery)).toString('base64');
  }

  private async getCachedValue(key: string): Promise<unknown | null> {
    try {
      const client = this.redisService.getClient();
      const value = await client.get(key);

      if (!value) {
        return null;
      }

      const cached = JSON.parse(JSON.stringify(value)) as CachedData;
      return cached.data;
    } catch (error) {
      this.logError('Failed to get cached value', error);
      return null;
    }
  }

  private async setCachedValue(
    key: string,
    value: unknown,
    ttl: number,
  ): Promise<void> {
    try {
      const client = this.redisService.getClient();
      const cacheData: CachedData = {
        timestamp: Date.now(),
        data: value,
      };

      const serializedValue = JSON.stringify(cacheData);
      await client.setex(key, ttl, serializedValue);

      this.logDebug('Cached value set', {
        key,
        ttl,
        size: serializedValue.length,
      });
    } catch (error) {
      this.logError('Failed to set cached value', error);
    }
  }

  public async clearCacheGroup(group: string): Promise<void> {
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
          this.logDebug('Cleared cache keys', {
            group,
            count: keys.length,
            keys,
          });
        }

        cursor = nextCursor;
      } while (cursor !== '0');

      this.logger.log(`Cleared ${totalCleared} keys from group: ${group}`);
    } catch (error) {
      this.logError(`Failed to clear cache group: ${group}`, error);
      throw error;
    }
  }

  private logDebug(message: string, context?: Record<string, unknown>): void {
    if (this.debug) {
      this.logger.debug(`[Cache] ${message}`, context);
    }
  }

  private logError(message: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.logger.error(`[Cache] ${message}: ${errorMessage}`, errorStack);
  }
}
