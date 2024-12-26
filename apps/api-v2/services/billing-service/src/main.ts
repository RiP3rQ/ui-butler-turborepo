import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { BillingModule } from './billing.module';
import { join } from 'path';

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
        url: `${process.env.BILLING_SERVICE_HOST || 'localhost'}:${process.env.BILLING_SERVICE_PORT || '3344'}`,
      },
    },
  );
  await app.listen();
  console.log('Billing Microservice is listening');
}

bootstrap();
