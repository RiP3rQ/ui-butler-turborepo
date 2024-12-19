import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ExecutionsModule } from './execution.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ExecutionsModule,
    {
      transport: Transport.TCP, // or Transport.REDIS, Transport.KAFKA, etc.
      options: {
        host: 'localhost',
        port: 3346, // different port for each service
      },
    },
  );
  await app.listen();
  console.log('Executions Microservice is listening');
}

bootstrap();
