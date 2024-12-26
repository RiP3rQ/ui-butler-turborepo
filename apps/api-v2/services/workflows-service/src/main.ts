import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { WorkflowsModule } from './workflows.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(WorkflowsModule, {
    transport: Transport.GRPC,
    options: {
      package: 'api.workflows',
      protoPath: join(
        __dirname,
        '../../../libs/proto/src/proto/workflows.proto',
      ),
      url: `${process.env.WORKFLOWS_SERVICE_HOST || 'localhost'}:${process.env.WORKFLOWS_SERVICE_PORT || '3342'}`,
    },
  });

  await app.listen();
  console.log('Workflows Microservice is listening');
}

bootstrap();
