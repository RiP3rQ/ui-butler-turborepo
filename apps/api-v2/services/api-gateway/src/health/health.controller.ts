import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipRateLimit } from '../decorators/rate-limit.decorator';

@ApiTags('Health')
@Controller('health')
@SkipRateLimit()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check API Gateway health' })
  @ApiResponse({
    status: 200,
    description: 'API Gateway is healthy',
  })
  public async check() {
    return this.health.check([
      // Basic service check
      () =>
        Promise.resolve({
          api_gateway: {
            status: 'up',
          },
        } as HealthIndicatorResult),

      // Memory checks with safe thresholds
      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024), // 500MB
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024), // 500MB
    ]);
  }

  @Get('liveness')
  @HealthCheck()
  @ApiOperation({ summary: 'Check if API Gateway is live' })
  @ApiResponse({
    status: 200,
    description: 'API Gateway is live',
  })
  public async checkLiveness() {
    return this.health.check([
      () =>
        Promise.resolve({
          alive: {
            status: 'up',
          },
        } as HealthIndicatorResult),
    ]);
  }

  @Get('readiness')
  @HealthCheck()
  @ApiOperation({ summary: 'Check if API Gateway is ready to accept requests' })
  @ApiResponse({
    status: 200,
    description: 'API Gateway is ready',
  })
  public async checkReadiness() {
    return this.health.check([
      () =>
        Promise.resolve({
          ready: {
            status: 'up',
          },
        } as HealthIndicatorResult),
    ]);
  }
}
