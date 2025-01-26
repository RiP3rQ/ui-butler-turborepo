import { SetMetadata } from '@nestjs/common';
import type { RateLimitConfig } from './rate-limit.interface';

export const RATE_LIMIT_KEY = 'rate_limit';
export const RateLimit = (config: RateLimitConfig) =>
  SetMetadata(RATE_LIMIT_KEY, config);
export const SkipRateLimit = () => SetMetadata(RATE_LIMIT_KEY, false);
