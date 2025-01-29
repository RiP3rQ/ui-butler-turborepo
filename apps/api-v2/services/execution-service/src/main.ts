import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { type MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ExecutionsModule } from './execution.module';

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
        url: `${process.env.EXECUTION_SERVICE_HOST ?? 'localhost'}:${process.env.EXECUTION_SERVICE_PORT ?? '3343'}`,
      },
    },
  );
  await app.listen();
  console.log('Execution Microservice is listening');
}

bootstrap().catch((error: unknown) => {
  console.error(`Execution Microservice failed to start: ${error}`);
  process.exit(1);
});
