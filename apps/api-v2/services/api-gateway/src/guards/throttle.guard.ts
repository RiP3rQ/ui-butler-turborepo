import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { rateLimitConfig } from '../config/rate-limit.config';
import { RateLimitStorage } from '../throttling/rate-limit-storage.abstract';
import { RateLimitConfig } from '../throttling/rate-limit.interface';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly storage: RateLimitStorage,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get route-specific config or fall back to global config
    const routeConfig = this.getRateLimitConfig(context);
    const config = {
      ttl: routeConfig?.ttl ?? rateLimitConfig().global.ttl,
      limit: routeConfig?.limit ?? rateLimitConfig().global.limit,
      errorMessage: routeConfig?.errorMessage ?? 'Too Many Requests',
    };

    const request = context.switchToHttp().getRequest<Request>();
    const key = this.generateKey(request, context);

    console.log('key', key);

    const rateLimitInfo = await this.storage.increment(
      key,
      Number(config.ttl),
      Number(config.limit),
    );

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
