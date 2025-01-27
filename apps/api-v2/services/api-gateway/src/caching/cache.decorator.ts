// cache.decorators.ts
import { SetMetadata } from '@nestjs/common';

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

export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);
export const CacheGroup = (group: string) =>
  SetMetadata(CACHE_GROUP_METADATA, group);
export const SkipCache = () => SetMetadata(CACHE_SKIP_METADATA, true);
