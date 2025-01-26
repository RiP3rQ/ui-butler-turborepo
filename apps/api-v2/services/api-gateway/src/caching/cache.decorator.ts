// cache.decorators.ts
import { SetMetadata } from '@nestjs/common';
import {
  CACHE_TTL_METADATA,
  CACHE_GROUP_METADATA,
  CACHE_SKIP_METADATA,
} from './custom-cache.interceptor';

export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);
export const CacheGroup = (group: string) =>
  SetMetadata(CACHE_GROUP_METADATA, group);
export const SkipCache = () => SetMetadata(CACHE_SKIP_METADATA, true);
