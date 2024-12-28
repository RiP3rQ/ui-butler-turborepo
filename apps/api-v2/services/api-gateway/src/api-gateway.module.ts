import { ClientsModule } from '@nestjs/microservices';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { PassportModule } from '@nestjs/passport';
import {
  GithubStrategy,
  GoogleStrategy,
  JwtRefreshStrategy,
  JwtStrategy,
  LocalStrategy,
} from '@app/common';
import { AnalyticsController } from './controllers/analytics.controller';
import { createGrpcOptions } from './config/grpc.config';
import { loggerConfig } from './logging/logger.config';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { HelmetMiddleware } from './middlewares/helmet.middleware';
import { PerformanceMetrics } from './metrics/performance.metrics';
import { CustomCacheInterceptor } from './interceptors/cache.interceptor';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TerminusModule,
    loggerConfig,
    ScheduleModule.forRoot(),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3333),

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
      // AUTH
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          createGrpcOptions(
            configService.get('AUTH_SERVICE_HOST'),
            configService.get('AUTH_SERVICE_PORT'),
            'api.auth',
            'auth',
          ),
        inject: [ConfigService],
      },
      {
        name: 'USERS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          createGrpcOptions(
            configService.get('USERS_SERVICE_HOST'),
            configService.get('USERS_SERVICE_PORT'),
            'api.users',
            'users',
          ),
        inject: [ConfigService],
      },
      {
        name: 'ANALYTICS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          createGrpcOptions(
            configService.get('ANALYTICS_SERVICE_HOST'),
            configService.get('ANALYTICS_SERVICE_PORT'),
            'api.analytics',
            'analytics',
          ),
        inject: [ConfigService],
      },
      {
        name: 'WORKFLOWS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          createGrpcOptions(
            configService.get('WORKFLOWS_SERVICE_HOST'),
            configService.get('WORKFLOWS_SERVICE_PORT'),
            'api.workflows',
            'workflows',
          ),
        inject: [ConfigService],
      },
      {
        name: 'EXECUTION_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          createGrpcOptions(
            configService.get('EXECUTION_SERVICE_HOST'),
            configService.get('EXECUTION_SERVICE_PORT'),
            'api.execution',
            'execution',
          ),
        inject: [ConfigService],
      },
      {
        name: 'BILLING_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          createGrpcOptions(
            configService.get('BILLING_SERVICE_HOST'),
            configService.get('BILLING_SERVICE_PORT'),
            'api.billing',
            'billing',
          ),
        inject: [ConfigService],
      },
      {
        name: 'COMPONENTS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          createGrpcOptions(
            configService.get('COMPONENTS_SERVICE_HOST'),
            configService.get('COMPONENTS_SERVICE_PORT'),
            'api.components',
            'components',
          ),
        inject: [ConfigService],
      },
      {
        name: 'PROJECTS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          createGrpcOptions(
            configService.get('PROJECTS_SERVICE_HOST'),
            configService.get('PROJECTS_SERVICE_PORT'),
            'api.projects',
            'projects',
          ),
        inject: [ConfigService],
      },
    ]),
    ThrottlerModule.forRootAsync({
      useFactory: getRateLimitConfig,
    }),
    // GRAFANA
    HealthModule,
    // PROMETHEUS
    MetricsModule,
    // CACHING SYSTEM
    CacheModule.register({
      ttl: 10 * 60 * 1000, // 10 minutes
      max: 100, // maximum number of items in cache
      isGlobal: true,
    }),
  ],
  controllers: [
    // ROUTE CONTROLLERS
    AnalyticsController,
    AuthController,
    BillingController,
    UsersController,
    ComponentsController,
    CredentialsController,
    ProjectsController,
    WorkflowsController,
    ExecutionsController,
  ],
  providers: [
    // AUTH PROXY
    AuthProxyService,
    // ERROR INTERCEPTOR
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },
    // THROTTLER
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Register all strategies
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    GithubStrategy,
    // PERFORMANCE METRICS
    PerformanceMetrics,
    {
      provide: APP_INTERCEPTOR,
      useClass: CustomCacheInterceptor,
    },
  ],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HelmetMiddleware).forRoutes('*');
  }
}
