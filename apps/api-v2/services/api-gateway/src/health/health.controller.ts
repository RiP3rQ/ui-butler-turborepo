import { Controller, Get, Inject } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import { ClientProxy, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private microservice: MicroserviceHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private config: ConfigService,
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    @Inject('USERS_SERVICE') private usersClient: ClientProxy,
    @Inject('WORKFLOW_SERVICE') private workflowClient: ClientProxy,
    @Inject('EXECUTION_SERVICE') private executionClient: ClientProxy,
    @Inject('BILLING_SERVICE') private billingClient: ClientProxy,
    @Inject('COMPONENTS_SERVICE') private componentsClient: ClientProxy,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      // Check microservices
      this.createServiceCheck('auth', this.authClient),
      this.createServiceCheck('users', this.usersClient),
      this.createServiceCheck('workflow', this.workflowClient),
      this.createServiceCheck('execution', this.executionClient),
      this.createServiceCheck('billing', this.billingClient),
      this.createServiceCheck('components', this.componentsClient),

      // Check memory usage
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024), // 150MB

      // Check disk usage
      () =>
        this.disk.checkStorage('storage', {
          thresholdPercent: 0.9, // 90%
          path: '/',
        }),
    ]);
  }

  @Get('/microservices')
  @HealthCheck()
  async checkMicroservices() {
    return this.health.check([
      this.createServiceCheck('auth', this.authClient),
      this.createServiceCheck('users', this.usersClient),
      this.createServiceCheck('workflow', this.workflowClient),
      this.createServiceCheck('execution', this.executionClient),
      this.createServiceCheck('billing', this.billingClient),
      this.createServiceCheck('components', this.componentsClient),
    ]);
  }

  @Get('/system')
  @HealthCheck()
  async checkSystem() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      () =>
        this.disk.checkStorage('storage', {
          thresholdPercent: 0.9,
          path: '/',
        }),
    ]);
  }

  private createServiceCheck(serviceName: string, client: ClientProxy) {
    return () =>
      this.microservice.pingCheck(serviceName, {
        transport: Transport.TCP,
        timeout: 5000,
        client: client,
      });
  }
}
