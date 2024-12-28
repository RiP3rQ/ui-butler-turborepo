import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { metricProviders } from './metrics.definitions';

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
  providers: [...metricProviders, MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
