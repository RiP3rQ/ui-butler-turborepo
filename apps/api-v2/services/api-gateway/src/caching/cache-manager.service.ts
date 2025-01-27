import { Injectable, Inject } from '@nestjs/common';
import { REDIS_CONNECTION, RedisService } from '@microservices/redis';

@Injectable()
export class CacheManager {
  constructor(
    @Inject(REDIS_CONNECTION)
    private readonly redisService: RedisService,
  ) {}

  public async clearCacheGroup(group: string): Promise<void> {
    const pattern = `cache:${group}:*`;
    await this.deleteByPattern(pattern);
  }

  private async deleteByPattern(pattern: string): Promise<void> {
    const client = this.redisService.getClient();
    let cursor = '0';

    do {
      const [nextCursor, keys] = await client.scan(cursor, {
        match: pattern,
        count: 100,
      });

      if (keys.length > 0) {
        await client.del(...keys);
      }

      cursor = nextCursor;
    } while (cursor !== '0');
  }
}
