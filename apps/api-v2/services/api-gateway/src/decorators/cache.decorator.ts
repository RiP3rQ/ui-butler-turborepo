import { SetMetadata } from '@nestjs/common';
import { CACHE_KEY_METADATA } from '../interceptors/cache.interceptor';

export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);
