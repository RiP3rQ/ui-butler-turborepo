import {
  GithubStrategy,
  GoogleStrategy,
  JwtRefreshStrategy,
  JwtStrategy,
  LocalStrategy,
} from '@microservices/common';
import { DatabaseModule } from '@microservices/database';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClientsModule } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import Joi from 'joi';
import { createGrpcOptions } from './config/grpc.config';
import { getRateLimitConfig } from './config/rate-limit.config';
import { AnalyticsController } from './controllers/analytics.controller';
import { AuthController } from './controllers/auth.controller';
import { BillingController } from './controllers/billing.controller';
import { ComponentsController } from './controllers/components.controller';
import { CredentialsController } from './controllers/credentials.controller';
import { ExecutionsController } from './controllers/execution.controller';
import { ProjectsController } from './controllers/projects.controller';
import { UsersController } from './controllers/users.controller';
import { WorkflowsController } from './controllers/workflows.controller';
import { HealthModule } from './health/health.module';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { loggerConfig } from './logging/logger.config';
import { MetricsModule } from './metrics/metrics.module';
import { HelmetMiddleware } from './middlewares/helmet.middleware';
import { AuthProxyService } from './proxies/auth.proxy.service';
import { GrpcClientProxy } from './proxies/grpc-client.proxy';
import { CustomCacheInterceptor } from './interceptors/custom-cache.interceptor';

@Module({
  imports: [
    DatabaseModule,
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

        WORKFLOWS_SERVICE_HOST: Joi.string().default('localhost'),
        WORKFLOWS_SERVICE_PORT: Joi.number().default(3342),

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
            configService.getOrThrow('AUTH_SERVICE_HOST'),
            configService.getOrThrow('AUTH_SERVICE_PORT'),
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
            configService.getOrThrow('USERS_SERVICE_HOST'),
            configService.getOrThrow('USERS_SERVICE_PORT'),
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
            configService.getOrThrow('ANALYTICS_SERVICE_HOST'),
            configService.getOrThrow('ANALYTICS_SERVICE_PORT'),
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
            configService.getOrThrow('WORKFLOWS_SERVICE_HOST'),
            configService.getOrThrow('WORKFLOWS_SERVICE_PORT'),
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
            configService.getOrThrow('EXECUTION_SERVICE_HOST'),
            configService.getOrThrow('EXECUTION_SERVICE_PORT'),
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
            configService.getOrThrow('BILLING_SERVICE_HOST'),
            configService.getOrThrow('BILLING_SERVICE_PORT'),
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
            configService.getOrThrow('COMPONENTS_SERVICE_HOST'),
            configService.getOrThrow('COMPONENTS_SERVICE_PORT'),
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
            configService.getOrThrow('PROJECTS_SERVICE_HOST'),
            configService.getOrThrow('PROJECTS_SERVICE_PORT'),
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
      ttl: 60000, // 1 minute default TTL
      max: 10, // maximum number of items in cache
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
    // gRPC CLIENT PROXY WITH RETRIES
    GrpcClientProxy,
    // CACHING
    CustomCacheInterceptor,
  ],
})
export class ApiGatewayModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(HelmetMiddleware).forRoutes('*');
  }
}
