import { join } from 'node:path';
import { DatabaseModule } from '@microservices/database';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        EXECUTION_SERVICE_HOST: Joi.string().required(),
        EXECUTION_SERVICE_PORT: Joi.number().required(),
        WORKFLOWS_SERVICE_HOST: Joi.string().required(),
        WORKFLOWS_SERVICE_PORT: Joi.number().required(),
      }),
    }),
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
          url: `${process.env.EXECUTION_SERVICE_HOST ?? 'localhost'}:${process.env.EXECUTION_SERVICE_PORT ?? '3343'}`,
        },
      },
    ]),
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService],
})
export class WorkflowsModule {}
