import { type ThrottlerModuleOptions } from '@nestjs/throttler';

export const getRateLimitConfig = (): ThrottlerModuleOptions => ({
  throttlers: [
    {
      name: 'default',
      ttl: 60000, // 60 seconds
      limit: 100,
    },
  ],
});

export interface RateLimitConfig {
  ttl: number;
  limit: number;
}

export const rateLimitConfigs = {
  default: {
    ttl: 60000, // 60 seconds
    limit: 100, // 10 requests per minute for defaults endpoints
  },
  ai: {
    ttl: 60000, // 60 seconds
    limit: 5, // 100 requests per minute for ai related endpoints
  },
  health: {
    ttl: 30000, // 30 seconds
    limit: 10, // 10 requests per 30 seconds for health checks
  },
} as const;
