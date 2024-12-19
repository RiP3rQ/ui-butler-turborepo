import { ClientsModule, Transport } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { servicesConfig } from './config/services.config';
import { AuthProxyService } from './proxies/auth.proxy.service';
import { AuthController } from './controllers/auth.controller';
import { BillingController } from './controllers/billing.controller';
import { UsersController } from './controllers/users.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { ComponentsController } from './controllers/components.controller';
import { CredentialsController } from './controllers/credentials.controller';
import { ProjectsController } from './controllers/projects.controller';
import { WorkflowsController } from './controllers/workflows.controller';
import { ExecutionsController } from './controllers/execution.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3339),
        AUTH_SERVICE_HOST: Joi.string().default('localhost'),
        AUTH_SERVICE_PORT: Joi.number().default(3340),
        // ... other service configurations //TODO: Add other service configurations
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
  ],
  providers: [
    AuthProxyService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },
  ],
})
export class ApiGatewayModule {}
