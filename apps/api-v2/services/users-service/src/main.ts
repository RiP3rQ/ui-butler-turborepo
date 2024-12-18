import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UsersModule } from './users.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Users Service');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    {
      transport: Transport.TCP, // or Transport.REDIS, Transport.KAFKA, etc.
      options: {
        host: 'localhost',
        port: 3344, // different port for each service
      },
    },
  );
  await app.listen();
  logger.log('Users Microservice is listening');
}

bootstrap();
