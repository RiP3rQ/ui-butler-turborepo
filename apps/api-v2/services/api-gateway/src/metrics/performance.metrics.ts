import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class PerformanceMetrics {
  private responseTimeHistogram: Histogram;
  private cacheHitsCounter: Counter;
  private cacheMissesCounter: Counter;
  private memoryUsageGauge: Counter;

  constructor(private readonly registry: Registry) {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    this.responseTimeHistogram = new Histogram({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in ms',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
    });

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

    this.memoryUsageGauge = new Counter({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type'],
    });

    // Register metrics
    this.registry.registerMetric(this.responseTimeHistogram);
    this.registry.registerMetric(this.cacheHitsCounter);
    this.registry.registerMetric(this.cacheMissesCounter);
    this.registry.registerMetric(this.memoryUsageGauge);
  }

  recordResponseTime(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ) {
    this.responseTimeHistogram
      .labels(method, route, statusCode.toString())
      .observe(duration);
  }

  incrementCacheHits(cacheType: string) {
    this.cacheHitsCounter.labels(cacheType).inc();
  }

  incrementCacheMisses(cacheType: string) {
    this.cacheMissesCounter.labels(cacheType).inc();
  }

  updateMemoryUsage() {
    const used = process.memoryUsage();
    this.memoryUsageGauge.labels('heapTotal').inc(used.heapTotal);
    this.memoryUsageGauge.labels('heapUsed').inc(used.heapUsed);
    this.memoryUsageGauge.labels('rss').inc(used.rss);
  }
}
