import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CacheService } from './cache.service';

@Injectable()
export class CacheCleanupService {
  constructor(private readonly cacheService: CacheService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async handleCacheCleanup() {
    // Clean cache older than 1 hours
    await this.cacheService.invalidateOld(1 * 60 * 60 * 1000);
  }
}
