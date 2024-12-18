import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AnalyticsModule } from './analytics.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Analytics Service');

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
  logger.log('Analytics Microservice is listening');
}

bootstrap();
