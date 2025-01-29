import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { type MicroserviceOptions, Transport } from '@nestjs/microservices';
import { BillingModule } from './billing.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BillingModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'api.billing',
        protoPath: join(
          __dirname,
          '../../../libs/proto/src/proto/billing.proto',
        ),
        url: `${process.env.BILLING_SERVICE_HOST ?? 'localhost'}:${process.env.BILLING_SERVICE_PORT ?? '3344'}`,
      },
    },
  );
  await app.listen();
  console.log('Billing Microservice is listening');
}

bootstrap().catch((error: unknown) => {
  console.error('Error starting Billing Microservice:', error);
  process.exit(1);
});
