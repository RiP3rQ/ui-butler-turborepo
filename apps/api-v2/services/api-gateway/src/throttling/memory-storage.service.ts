import { Injectable } from '@nestjs/common';
import type { RateLimitInfo } from './rate-limit.interface';
import { RateLimitStorage } from './rate-limit-storage.abstract';

interface StorageRecord {
  hits: number;
  expires: number;
  limit: number;
}

@Injectable()
export class MemoryStorage implements RateLimitStorage {
  private storage = new Map<string, StorageRecord>();

  // eslint-disable-next-line @typescript-eslint/require-await --- This is a sync method
  public async increment(
    key: string,
    ttl: number,
    limit: number,
  ): Promise<RateLimitInfo> {
    this.cleanup();

    const now = Date.now();
    const record = this.storage.get(key);

    if (!record) {
      const newRecord = {
        hits: 1,
        expires: now + ttl * 1000,
        limit,
      };
      this.storage.set(key, newRecord);

      return {
        totalHits: 1,
        remainingHits: limit - 1,
        resetsIn: ttl,
      };
    }

    record.hits++;
    return {
      totalHits: record.hits,
      remainingHits: limit - record.hits,
      resetsIn: Math.ceil((record.expires - now) / 1000),
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await --- This is a sync method
  public async reset(key: string): Promise<void> {
    this.storage.delete(key);
  }

  // eslint-disable-next-line @typescript-eslint/require-await --- This is a sync method
  public async get(key: string): Promise<RateLimitInfo | null> {
    const record = this.storage.get(key);
    if (!record) return null;

    const now = Date.now();
    return {
      totalHits: record.hits,
      remainingHits: 0,
      resetsIn: Math.ceil((record.expires - now) / 1000),
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.storage.entries()) {
      if (value.expires <= now) {
        this.storage.delete(key);
      }
    }
  }
}
