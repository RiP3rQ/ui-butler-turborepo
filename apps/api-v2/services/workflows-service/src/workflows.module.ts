import { join } from 'node:path';
import { DatabaseModule } from '@microservices/database';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';

@Module({
  imports: [
    DatabaseModule,
    // Import the ClientsModule and register the EXECUTIONS_SERVICE client for communication with the execution service
    // @ts-expect-error - In Nest v11 the type of the options is not correct
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
          url: `${process.env.EXECUTION_SERVICE_HOST ?? 'localhost'}:${process.env.EXECUTION_SERVICE_PORT ?? '3343'}`,
        },
      },
    ]),
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService],
})
export class WorkflowsModule {}
