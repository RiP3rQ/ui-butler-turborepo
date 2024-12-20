import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    DatabaseModule,
    // Import the ClientsModule and register the EXECUTIONS_SERVICE client for communication with the execution service
    ClientsModule.register([
      {
        name: 'EXECUTIONS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.EXECUTIONS_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.EXECUTIONS_SERVICES_PORT, 10) || 3343,
        },
      },
    ]),
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService],
})
export class WorkflowsModule {}
