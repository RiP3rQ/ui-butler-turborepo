import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { BillingModule } from './billing.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BillingModule,
    {
      transport: Transport.TCP, // or Transport.REDIS, Transport.KAFKA, etc.
      options: {
        host: 'localhost',
        port: 3344, // different port for each service
      },
    },
  );
  await app.listen();
  console.log('Billing Microservice is listening');
}

bootstrap();
