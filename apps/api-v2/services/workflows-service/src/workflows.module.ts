import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    DatabaseModule,
    // Import the ClientsModule and register the EXECUTION_SERVICE client for communication with the execution service
    ClientsModule.register([
      {
        name: 'EXECUTION_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.EXECUTION_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.EXECUTION_SERVICE_PORT, 10) || 3346,
        },
      },
    ]),
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService],
})
export class WorkflowsModule {}
