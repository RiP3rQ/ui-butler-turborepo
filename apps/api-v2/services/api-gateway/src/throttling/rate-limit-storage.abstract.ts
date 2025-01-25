import type { RateLimitInfo } from './rate-limit.interface';

export abstract class RateLimitStorage {
  public abstract increment(
    key: string,
    ttl: number,
    limit: number,
  ): Promise<RateLimitInfo>;
  public abstract reset(key: string): Promise<void>;
  public abstract get(key: string): Promise<RateLimitInfo | null>;
}
