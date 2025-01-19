import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Registry } from 'prom-client';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { metricProviders } from './metrics.definitions';
import { PerformanceMetrics } from './performance.metrics';
import { DatabaseStatsService } from './database-stats.service';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/not-used', // This effectively disables the default controller
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'api_gateway_',
        },
      },
      defaultLabels: {
        app: 'api_gateway',
      },
    }),
  ],
  controllers: [MetricsController],
  providers: [
    {
      provide: Registry,
      useValue: new Registry(),
    },
    ...metricProviders,
    MetricsService,
    // PERFORMANCE METRICS
    PerformanceMetrics,
    // DATABASE METRICS
    DatabaseStatsService,
  ],
  exports: [MetricsService, PerformanceMetrics],
})
export class MetricsModule {}
