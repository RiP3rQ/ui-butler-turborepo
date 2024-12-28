import { Controller, Get, Header, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { SkipThrottle } from '@nestjs/throttler';
import { type Response } from 'express';

@ApiTags('Metrics')
@Controller('metrics')
@SkipThrottle()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  async getMetrics(@Res() response: Response) {
    const metrics = await this.metricsService.getMetrics();
    return response
      .setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
      .send(metrics);
  }
}
