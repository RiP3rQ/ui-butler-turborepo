// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Health')
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check overall system health' })
  async check() {
    return this.health.check([
      // Memory health check
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024), // 150MB

      // Disk health check
      () =>
        this.disk.checkStorage('disk_storage', {
          thresholdPercent: 0.9,
          path: '/',
        }),

      // Microservices health checks
      () =>
        this.microservice.pingCheck('auth_service', {
          transport: Transport.GRPC,
          options: {
            url: `${this.configService.get('AUTH_SERVICE_HOST')}:${this.configService.get(
              'AUTH_SERVICE_PORT',
            )}`,
          },
        }),

      () =>
        this.microservice.pingCheck('users_service', {
          transport: Transport.GRPC,
          options: {
            url: `${this.configService.get('USERS_SERVICE_HOST')}:${this.configService.get(
              'USERS_SERVICE_PORT',
            )}`,
          },
        }),

      () =>
        this.microservice.pingCheck('analytics_service', {
          transport: Transport.GRPC,
          options: {
            url: `${this.configService.get('ANALYTICS_SERVICE_HOST')}:${this.configService.get(
              'ANALYTICS_SERVICE_PORT',
            )}`,
          },
        }),

      () =>
        this.microservice.pingCheck('billing_service', {
          transport: Transport.GRPC,
          options: {
            url: `${this.configService.get('BILLING_SERVICE_HOST')}:${this.configService.get(
              'BILLING_SERVICE_PORT',
            )}`,
          },
        }),

      () =>
        this.microservice.pingCheck('components_service', {
          transport: Transport.GRPC,
          options: {
            url: `${this.configService.get('COMPONENTS_SERVICE_HOST')}:${this.configService.get(
              'COMPONENTS_SERVICE_PORT',
            )}`,
          },
        }),

      () =>
        this.microservice.pingCheck('execution_service', {
          transport: Transport.GRPC,
          options: {
            url: `${this.configService.get('EXECUTION_SERVICE_HOST')}:${this.configService.get(
              'EXECUTION_SERVICE_PORT',
            )}`,
          },
        }),

      () =>
        this.microservice.pingCheck('projects_service', {
          transport: Transport.GRPC,
          options: {
            url: `${this.configService.get('PROJECTS_SERVICE_HOST')}:${this.configService.get(
              'PROJECTS_SERVICE_PORT',
            )}`,
          },
        }),

      () =>
        this.microservice.pingCheck('workflows_service', {
          transport: Transport.GRPC,
          options: {
            url: `${this.configService.get('WORKFLOWS_SERVICE_HOST')}:${this.configService.get(
              'WORKFLOWS_SERVICE_PORT',
            )}`,
          },
        }),
    ]);
  }

  @Get('liveness')
  @HealthCheck()
  @ApiOperation({ summary: 'Check if the application is live' })
  async checkLiveness() {
    return this.health.check([
      // Basic checks to ensure the application is running
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
    ]);
  }

  @Get('readiness')
  @HealthCheck()
  @ApiOperation({
    summary: 'Check if the application is ready to accept requests',
  })
  async checkReadiness() {
    return this.health.check([
      // Check all microservices
      () =>
        this.microservice.pingCheck('auth_service', {
          transport: Transport.GRPC,
          options: {
            url: `${this.configService.get('AUTH_SERVICE_HOST')}:${this.configService.get(
              'AUTH_SERVICE_PORT',
            )}`,
          },
        }),
      // Add other microservices checks
    ]);
  }
}
