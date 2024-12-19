import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { WorkflowsModule } from './workflows.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(WorkflowsModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.WORKFLOWS_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.WORKFLOWS_SERVICE_PORT, 10) || 3342,
    },
  });

  await app.listen();
  console.log('Workflows Microservice is listening');
}

bootstrap();
