import { registerAs } from '@nestjs/config';

export const rateLimitConfig = registerAs('rateLimit', () => ({
  global: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60', 10),
    limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100', 10),
  },
  storage: {
    type: process.env.RATE_LIMIT_STORAGE ?? 'memory',
    redis: {
      url: process.env.REDIS_URL ?? 'localhost',
      token: process.env.REDIS_TOKEN ?? 'token',
    },
  },
}));
