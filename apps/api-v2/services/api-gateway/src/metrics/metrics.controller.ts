import { Controller, Get, Header, Logger, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Response } from 'express';
import { SkipRateLimit } from '../throttling/rate-limit.decorator';
import { MetricsService } from './metrics.service';

@ApiTags('Metrics')
@Controller('metrics')
@SkipRateLimit()
export class MetricsController {
  private readonly logger = new Logger(MetricsController.name);

  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  public async getMetrics(@Res() response: Response) {
    try {
      const metrics = await this.metricsService.getMetrics();
      return response
        .setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
        .send(metrics);
    } catch (error) {
      this.logger.error('Failed to retrieve metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Return a minimal metrics response in case of error
      const errorMetrics = [
        '# HELP metrics_collection_error Indicates metrics collection failure',
        '# TYPE metrics_collection_error gauge',
        'metrics_collection_error 1',
      ].join('\n');

      return response
        .status(500)
        .setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
        .send(errorMetrics);
    }
  }
}
