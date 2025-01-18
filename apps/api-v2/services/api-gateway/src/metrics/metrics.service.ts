import { Injectable, Logger } from '@nestjs/common';
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { DatabaseStatsService } from './database-stats.service';

export type MetricLabels = Record<string, string>;

export interface HttpMetricLabels extends MetricLabels {
  method: string;
  route: string;
  status: string;
}

export interface GrpcMetricLabels extends MetricLabels {
  service: string;
  method: string;
  status: string;
}

export class MetricError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'MetricError';
  }
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly registry: Registry;
  private readonly DEFAULT_ERROR_MESSAGE = 'Unknown error';

  constructor(
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram,
    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotal: Counter,
    @InjectMetric('grpc_requests_total')
    private readonly grpcRequestsTotal: Counter,
    private readonly databaseStats: DatabaseStatsService,
  ) {
    // Initialize registry in constructor
    this.registry = new Registry();
    this.initializeMetrics();
  }

  /**
   * Initialize metrics with default metrics and custom metrics
   */
  private initializeMetrics(): void {
    this.registerCustomMetrics();
    this.enableDefaultMetrics();
  }

  /**
   * Register custom metrics with the registry
   */
  private registerCustomMetrics(): void {
    this.registry.registerMetric(this.httpRequestDuration);
    this.registry.registerMetric(this.httpRequestsTotal);
    this.registry.registerMetric(this.grpcRequestsTotal);
  }

  /**
   * Enable default Prometheus metrics
   */
  private enableDefaultMetrics(): void {
    collectDefaultMetrics({ register: this.registry });
  }

  /**
   * Get all metrics including general and database metrics
   */
  public async getMetrics(): Promise<string> {
    try {
      const [generalMetrics, dbMetrics] = await Promise.all([
        this.registry.metrics(),
        this.databaseStats.getMetrics(),
      ]);

      return this.formatCombinedMetrics(generalMetrics, dbMetrics);
    } catch (error) {
      this.handleMetricError('Failed to collect metrics', error);
      throw new MetricError('Failed to collect metrics', error);
    }
  }

  /**
   * Record HTTP request metrics
   */
  public recordHttpRequest(
    method: string,
    route: string,
    status: number,
    duration: number,
  ): void {
    const labels = this.createHttpLabels(method, route, status);

    this.safeExecute(() => {
      this.httpRequestDuration
        .labels(...Object.values(labels))
        .observe(duration);
      this.httpRequestsTotal.labels(...Object.values(labels)).inc();
    }, 'Failed to record HTTP request metrics');
  }

  /**
   * Helper Methods
   */
  private createHttpLabels(
    method: string,
    route: string,
    status: number,
  ): HttpMetricLabels {
    return {
      method,
      route,
      status: status.toString(),
    };
  }

  private formatCombinedMetrics(
    generalMetrics: string,
    dbMetrics: string,
  ): string {
    return [
      '# General metrics',
      generalMetrics,
      '# Database metrics',
      dbMetrics,
    ]
      .filter(Boolean)
      .join('\n')
      .split('\n')
      .filter((line) => line.trim())
      .join('\n');
  }

  private handleMetricError(message: string, error: unknown): void {
    const errorMessage =
      error instanceof Error ? error.message : this.DEFAULT_ERROR_MESSAGE;
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.logger.error(message, {
      error: errorMessage,
      stack: errorStack,
    });
  }

  private safeExecute(operation: () => void, errorMessage: string): void {
    try {
      operation();
    } catch (error) {
      this.handleMetricError(errorMessage, error);
    }
  }
}
