import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AnalyticsModule } from './analytics.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AnalyticsModule, {
    transport: Transport.GRPC,
    options: {
      package: 'api.analytics',
      protoPath: join(
        __dirname,
        '../../../libs/proto/src/proto/analytics.proto',
      ),
      url: `${process.env.ANALYTICS_SERVICE_HOST ?? 'localhost'}:${process.env.ANALYTICS_SERVICE_PORT ?? '3347'}`,
    },
  });

  await app.listen();
  console.log('Analytics  Microservice is listening on gRPC');
}

bootstrap().catch((error: unknown) => {
  console.error(`Error starting Analytics Microservice: ${error}`);
  process.exit(1);
});
