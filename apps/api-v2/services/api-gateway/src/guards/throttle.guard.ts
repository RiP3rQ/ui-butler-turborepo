// rate-limit.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { RateLimitConfig } from '../throttling/rate-limit.interface';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';
import { RateLimitStorage } from '../throttling/rate-limit-storage.abstract';
import { rateLimitConfig } from '../throttling/rate-limit.config';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private storage: RateLimitStorage,
    @Inject(rateLimitConfig.KEY)
    private config: ConfigType<typeof rateLimitConfig>,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get route-specific config or fall back to global config
    const routeConfig = this.getRateLimitConfig(context);
    const config = {
      ttl: routeConfig?.ttl ?? this.config.global.ttl,
      limit: routeConfig?.limit ?? this.config.global.limit,
      errorMessage: routeConfig?.errorMessage ?? 'Too Many Requests',
    };

    const request = context.switchToHttp().getRequest<Request>();
    const key = this.generateKey(request, context);

    const rateLimitInfo = await this.storage.increment(
      key,
      config.ttl,
      config.limit,
    );

    console.log('rateLimitInfo', rateLimitInfo);

    if (rateLimitInfo.remainingHits < 0) {
      throw new HttpException(
        {
          message: config.errorMessage,
          remainingTime: rateLimitInfo.resetsIn,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add rate limit info to response headers
    const response = context.switchToHttp().getResponse<Response>();
    response.setHeader('X-RateLimit-Limit', String(config.limit));
    response.setHeader(
      'X-RateLimit-Remaining',
      String(rateLimitInfo.remainingHits),
    );
    response.setHeader('X-RateLimit-Reset', String(rateLimitInfo.resetsIn));

    return true;
  }

  private getRateLimitConfig(
    context: ExecutionContext,
  ): RateLimitConfig | null {
    const config = this.reflector.getAllAndOverride<RateLimitConfig>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );
    return config;
  }

  private generateKey(request: Request, context: ExecutionContext): string {
    const ip = String(
      request.ip ?? request.headers['x-forwarded-for'] ?? 'unknown',
    );
    const handler = context.getHandler().name;
    const className = context.getClass().name;
    return `rate_limit:${ip}:${className}:${handler}`;
  }
}
