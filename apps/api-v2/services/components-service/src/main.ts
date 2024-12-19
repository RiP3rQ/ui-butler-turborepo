import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ComponentsModule } from './components.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(ComponentsModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.COMPONENTS_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.COMPONENTS_SERVICE_PORT, 10) || 3345,
    },
  });

  await app.listen();
  console.log('Components Microservice is listening');
}

bootstrap();
