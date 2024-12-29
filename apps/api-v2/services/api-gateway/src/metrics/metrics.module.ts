import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { metricProviders } from './metrics.definitions';
import { PerformanceMetrics } from './performance.metrics';
import { Registry } from 'prom-client';

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
  ],
  exports: [MetricsService, PerformanceMetrics],
})
export class MetricsModule {}
