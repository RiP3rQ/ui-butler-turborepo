import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ExecutionsModule } from './execution.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ExecutionsModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'api.execution',
        protoPath: join(
          __dirname,
          '../../../libs/proto/src/proto/execution.proto',
        ),
        url: `${process.env.EXECUTION_SERVICE_HOST || 'localhost'}:${process.env.EXECUTION_SERVICE_PORT || '3343'}`,
      },
    },
  );
  await app.listen();
  console.log('Execution Microservice is listening');
}

bootstrap();
