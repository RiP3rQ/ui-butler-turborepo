import { ClientsModule, Transport } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { AuthProxyService } from './proxies/auth.proxy.service';
import { AuthController } from './controllers/auth.controller';
import { BillingController } from './controllers/billing.controller';
import { UsersController } from './controllers/users.controller';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { ComponentsController } from './controllers/components.controller';
import { CredentialsController } from './controllers/credentials.controller';
import { ProjectsController } from './controllers/projects.controller';
import { WorkflowsController } from './controllers/workflows.controller';
import { ExecutionsController } from './controllers/execution.controller';
import { TerminusModule } from '@nestjs/terminus';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { getRateLimitConfig } from './config/rate-limit.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    ClientsModule.registerAsync([
      {
        name: 'WORKFLOWS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('WORKFLOW_SERVICE_HOST', 'localhost'),
            port: configService.get('WORKFLOW_SERVICE_PORT', 3342),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('AUTH_SERVICE_HOST', 'localhost'),
            port: configService.get('AUTH_SERVICE_PORT', 3340),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'USERS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('USERS_SERVICE_HOST', 'localhost'),
            port: configService.get('USERS_SERVICE_PORT', 3341),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'EXECUTIONS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('EXECUTIONS_SERVICE_HOST', 'localhost'),
            port: configService.get('EXECUTIONS_SERVICE_PORT', 3343),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'BILLING_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('BILLING_SERVICE_HOST', 'localhost'),
            port: configService.get('BILLING_SERVICE_PORT', 3344),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'COMPONENTS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('COMPONENTS_SERVICE_HOST', 'localhost'),
            port: configService.get('COMPONENTS_SERVICE_PORT', 3345),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'PROJECTS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('PROJECTS_SERVICE_HOST', 'localhost'),
            port: configService.get('PROJECTS_SERVICE_PORT', 3346),
          },
        }),
        inject: [ConfigService],
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
    // HealthController,
  ],
  providers: [
    AuthProxyService,
    // ERROR INTERCEPTOR
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },
    // HEALTH CONTROLLERS
    // MemoryHealthIndicator,
    // DiskHealthIndicator,
    // THROTTLER
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class ApiGatewayModule {}
