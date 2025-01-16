import { Injectable, Logger } from '@nestjs/common';
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { DatabaseStatsService } from './database-stats.service';

interface HttpMetricLabels {
  method: string;
  route: string;
  status: string;
}

interface GrpcMetricLabels {
  service: string;
  method: string;
  status: string;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly registry: Registry;

  constructor(
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,
    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotal: Counter<string>,
    @InjectMetric('grpc_requests_total')
    private readonly grpcRequestsTotal: Counter<string>,
    private readonly databaseStats: DatabaseStatsService,
  ) {
    this.registry = new Registry();

    // Register metrics
    this.registry.registerMetric(this.httpRequestDuration);
    this.registry.registerMetric(this.httpRequestsTotal);
    this.registry.registerMetric(this.grpcRequestsTotal);

    // Enable default metrics
    collectDefaultMetrics({ register: this.registry });
  }

  // Method to get all metrics
  async getMetrics(): Promise<string> {
    try {
      // Collect both general and database metrics
      const [generalMetrics, dbMetrics] = await Promise.all([
        this.registry.metrics(),
        this.databaseStats.getMetrics(),
      ]);

      // Combine metrics with proper formatting
      const combinedMetrics = [
        '# General metrics',
        generalMetrics,
        '# Database metrics',
        dbMetrics,
      ].join('\n');

      return combinedMetrics;
    } catch (error) {
      this.logger.error('Failed to collect metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  // Record HTTP request duration
  recordHttpRequestDuration(
    method: string,
    route: string,
    status: number,
    duration: number,
  ): void {
    try {
      const labels: HttpMetricLabels = {
        method,
        route,
        status: status.toString(),
      };

      this.httpRequestDuration
        .labels(labels.method, labels.route, labels.status)
        .observe(duration);
    } catch (error) {
      this.logger.error('Failed to record HTTP request duration', {
        error: error instanceof Error ? error.message : 'Unknown error',
        method,
        route,
        status,
        duration,
      });
    }
  }

  // Increment HTTP requests counter
  incrementHttpRequests(method: string, route: string, status: number): void {
    try {
      const labels: HttpMetricLabels = {
        method,
        route,
        status: status.toString(),
      };

      this.httpRequestsTotal
        .labels(labels.method, labels.route, labels.status)
        .inc();
    } catch (error) {
      this.logger.error('Failed to increment HTTP requests counter', {
        error: error instanceof Error ? error.message : 'Unknown error',
        method,
        route,
        status,
      });
    }
  }

  // Record complete HTTP request (both duration and increment)
  recordHttpRequest(
    method: string,
    route: string,
    status: number,
    duration: number,
  ): void {
    this.recordHttpRequestDuration(method, route, status, duration);
    this.incrementHttpRequests(method, route, status);
  }

  // Increment gRPC requests counter
  incrementGrpcRequests(service: string, method: string, status: string): void {
    try {
      const labels: GrpcMetricLabels = {
        service,
        method,
        status,
      };

      this.grpcRequestsTotal
        .labels(labels.service, labels.method, labels.status)
        .inc();
    } catch (error) {
      this.logger.error('Failed to increment gRPC requests counter', {
        error: error instanceof Error ? error.message : 'Unknown error',
        service,
        method,
        status,
      });
    }
  }

  // Get specific metric
  async getMetric(name: string): Promise<any> {
    try {
      const metric = await this.registry.getSingleMetric(name);
      return metric ? await metric.get() : null;
    } catch (error) {
      this.logger.error(
        `Failed to get metric ${name}`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }

  // Reset metrics (useful for testing)
  async resetMetrics(): Promise<void> {
    try {
      await this.registry.resetMetrics();
    } catch (error) {
      this.logger.error(
        'Failed to reset metrics',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }

  // Helper method to format metrics for better readability
  private formatMetrics(metrics: string): string {
    return metrics
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join('\n');
  }
}
