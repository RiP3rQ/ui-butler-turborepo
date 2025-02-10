import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { WorkflowsModule } from './workflows.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(WorkflowsModule, {
    transport: Transport.GRPC,
    options: {
      package: 'api.workflows',
      protoPath: join(
        __dirname,
        '../../../libs/proto/src/proto/workflows.proto',
      ),
      url: `${process.env.WORKFLOWS_SERVICE_HOST ?? 'localhost'}:${process.env.WORKFLOWS_SERVICE_PORT ?? '3342'}`,
    },
  });

  await app.listen();
  console.log('Workflows Microservice is listening');
}

bootstrap().catch((error: unknown) => {
  console.error(`Workflows Microservice failed to start:`, error);
  process.exit(1);
});
