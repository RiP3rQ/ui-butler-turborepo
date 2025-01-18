import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram, Registry } from 'prom-client';

@Injectable()
export class PerformanceMetrics {
  private responseTimeHistogram: Histogram;
  private requestCounter: Counter;
  private errorCounter: Counter;
  private cacheHitsCounter: Counter;
  private cacheMissesCounter: Counter;
  private memoryGauge: Gauge;
  private activeConnectionsGauge: Gauge;

  constructor(private readonly registry: Registry) {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // Response Time Metrics
    this.responseTimeHistogram = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    // Request Counter
    this.requestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    // Error Counter
    this.errorCounter = new Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'error_code'],
    });

    // Cache Metrics
    this.cacheHitsCounter = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_type'],
    });

    this.cacheMissesCounter = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_type'],
    });

    // Memory Usage
    this.memoryGauge = new Gauge({
      name: 'process_memory_usage_bytes',
      help: 'Process memory usage in bytes',
      labelNames: ['type'],
    });

    // Active Connections
    this.activeConnectionsGauge = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
    });

    // Register all metrics
    this.registry.registerMetric(this.responseTimeHistogram);
    this.registry.registerMetric(this.requestCounter);
    this.registry.registerMetric(this.errorCounter);
    this.registry.registerMetric(this.cacheHitsCounter);
    this.registry.registerMetric(this.cacheMissesCounter);
    this.registry.registerMetric(this.memoryGauge);
    this.registry.registerMetric(this.activeConnectionsGauge);
  }

  // Metric recording methods
  public recordResponseTime(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ) {
    this.responseTimeHistogram
      .labels(method, route, statusCode.toString())
      .observe(duration);
  }

  public incrementRequestCount(
    method: string,
    route: string,
    statusCode: number,
  ) {
    this.requestCounter.labels(method, route, statusCode.toString()).inc();
  }

  public incrementErrorCount(method: string, route: string, errorCode: string) {
    this.errorCounter.labels(method, route, errorCode).inc();
  }

  public incrementCacheHits(cacheType: string) {
    this.cacheHitsCounter.labels(cacheType).inc();
  }

  public incrementCacheMisses(cacheType: string) {
    this.cacheMissesCounter.labels(cacheType).inc();
  }

  public updateMemoryUsage() {
    const used = process.memoryUsage();
    this.memoryGauge.labels('heap_total').set(used.heapTotal);
    this.memoryGauge.labels('heap_used').set(used.heapUsed);
    this.memoryGauge.labels('rss').set(used.rss);
  }

  public setActiveConnections(count: number) {
    this.activeConnectionsGauge.set(count);
  }
}
