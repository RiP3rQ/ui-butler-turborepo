import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    DatabaseModule,
    // Import the ClientsModule and register the EXECUTIONS_SERVICE client for communication with the execution service
    ClientsModule.register([
      {
        name: 'EXECUTIONS_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'api.execution',
          protoPath: join(
            __dirname,
            '../../../libs/proto/src/proto/execution.proto',
          ),
          url: `${process.env.EXECUTION_SERVICE_HOST || 'localhost'}:${process.env.EXECUTION_SERVICES_PORT || '3343'}`,
        },
      },
    ]),
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService],
})
export class WorkflowsModule {}
