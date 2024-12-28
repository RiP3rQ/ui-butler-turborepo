import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { metricProviders } from './metrics.definitions';
import { Registry } from 'prom-client';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'api_gateway_',
        },
      },
    }),
  ],
  controllers: [MetricsController],
  providers: [
    ...metricProviders,
    {
      provide: 'PROMETHEUS_REGISTRY',
      useValue: new Registry(),
    },
    MetricsService,
  ],
  exports: [MetricsService],
})
export class MetricsModule {}
