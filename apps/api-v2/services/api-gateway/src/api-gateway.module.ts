import { ClientsModule, Transport } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { servicesConfig } from './config/services.config';
import { AuthProxyService } from './proxies/auth.proxy.service';
import { AuthController } from './controllers/auth.controller';
import { BillingController } from './controllers/billing.controller';
import { UsersController } from './controllers/users.controller';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { ComponentsController } from './controllers/components.controller';
import { CredentialsController } from './controllers/credentials.controller';
import { ProjectsController } from './controllers/projects.controller';
import { WorkflowsController } from './controllers/workflows.controller';
import { ExecutionsController } from './controllers/execution.controller';
import {
  DiskHealthIndicator,
  MemoryHealthIndicator,
  TerminusModule,
} from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { getRateLimitConfig } from './config/rate-limit.config';

@Module({
  imports: [
    TerminusModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3339),

        AUTH_SERVICE_HOST: Joi.string().default('localhost'),
        AUTH_SERVICE_PORT: Joi.number().default(3340),

        USERS_SERVICE_HOST: Joi.string().default('localhost'),
        USERS_SERVICE_PORT: Joi.number().default(3341),

        WORKFLOW_SERVICE_HOST: Joi.string().default('localhost'),
        WORKFLOW_SERVICE_PORT: Joi.number().default(3342),

        EXECUTION_SERVICE_HOST: Joi.string().default('localhost'),
        EXECUTION_SERVICE_PORT: Joi.number().default(3343),

        BILLING_SERVICE_HOST: Joi.string().default('localhost'),
        BILLING_SERVICE_PORT: Joi.number().default(3344),

        COMPONENTS_SERVICE_HOST: Joi.string().default('localhost'),
        COMPONENTS_SERVICE_PORT: Joi.number().default(3345),
      }),
    }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: servicesConfig.auth,
      },
      {
        name: 'ANALYTICS_SERVICE',
        transport: Transport.TCP,
        options: servicesConfig.analytics,
      },
      {
        name: 'BILLING_SERVICE',
        transport: Transport.TCP,
        options: servicesConfig.billing,
      },
      {
        name: 'PROJECTS_SERVICE',
        transport: Transport.TCP,
        options: servicesConfig.projects,
      },
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: servicesConfig.users,
      },
      {
        name: 'WORKFLOW_SERVICE',
        transport: Transport.TCP,
        options: servicesConfig.workflow,
      },
      {
        name: 'EXECUTION_SERVICE',
        transport: Transport.TCP,
        options: servicesConfig.execution,
      },
      {
        name: 'COMPONENTS_SERVICE',
        transport: Transport.TCP,
        options: servicesConfig.components,
      },
    ]),
    ThrottlerModule.forRootAsync({
      useFactory: getRateLimitConfig,
    }),
  ],
  controllers: [
    AuthController,
    AuthController,
    BillingController,
    UsersController,
    ComponentsController,
    CredentialsController,
    ProjectsController,
    WorkflowsController,
    ExecutionsController,
    // HEALTH CONTROLLERS
    HealthController,
  ],
  providers: [
    AuthProxyService,
    // ERROR INTERCEPTOR
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },
    // HEALTH CONTROLLERS
    MemoryHealthIndicator,
    DiskHealthIndicator,
    // THROTTLER
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class ApiGatewayModule {}
