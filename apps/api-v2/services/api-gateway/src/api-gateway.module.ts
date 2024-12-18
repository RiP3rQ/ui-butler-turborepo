import { ClientsModule, Transport } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { servicesConfig } from './config/services.config';
import { AuthProxyService } from './proxies/auth.proxy.service';

@Module({
  imports: [
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
    ]),
  ],
  controllers: [],
  providers: [AuthProxyService],
})
export class ApiGatewayModule {}
