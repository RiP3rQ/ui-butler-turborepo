import { registerAs } from '@nestjs/config';

export const rateLimitConfig = registerAs('rateLimit', () => ({
  global: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60', 10),
    limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100', 10),
  },
  storage: {
    type: process.env.RATE_LIMIT_STORAGE ?? 'memory',
    redis: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    },
  },
}));
