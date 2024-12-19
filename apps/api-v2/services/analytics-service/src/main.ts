import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AnalyticsModule } from './analytics.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AnalyticsModule,
    {
      transport: Transport.TCP, // or Transport.REDIS, Transport.KAFKA, etc.
      options: {
        host: 'localhost',
        port: 3341, // different port for each service
      },
    },
  );
  await app.listen();
  console.log('Analytics Microservice is listening');
}

bootstrap();
