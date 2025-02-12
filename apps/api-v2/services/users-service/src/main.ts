import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { UsersModule } from './users/users.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(UsersModule, {
    transport: Transport.GRPC,
    options: {
      package: 'api.users',
      protoPath: join(__dirname, '../../../libs/proto/src/proto/users.proto'),
      url: `${process.env.USERS_SERVICE_HOST ?? 'localhost'}:${process.env.USERS_SERVICE_PORT ?? '3341'}`,
    },
  });

  await app.listen();
  console.log('Users Microservice is listening on gRPC');
}

bootstrap().catch((error: unknown) => {
  console.error(`Error starting Users + Credentials Microservice:`, error);
  process.exit(1);
});
