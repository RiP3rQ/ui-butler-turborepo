import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AuthModule, {
    transport: Transport.GRPC,
    options: {
      package: 'api.auth',
      protoPath: join(__dirname, '../../../libs/proto/src/proto/auth.proto'),
      url: `${process.env.AUTH_SERVICE_HOST ?? 'localhost'}:${process.env.AUTH_SERVICE_PORT ?? '3340'}`,
    },
  });

  const configService = app.get(ConfigService);

  // Validate required environment variables
  const requiredEnvVars = [
    'JWT_ACCESS_TOKEN_SECRET',
    'JWT_REFRESH_TOKEN_SECRET',
    'JWT_ACCESS_TOKEN_EXPIRATION_MS',
    'JWT_REFRESH_TOKEN_EXPIRATION_MS',
  ];

  for (const envVar of requiredEnvVars) {
    configService.getOrThrow(envVar);
  }

  await app.listen();
  console.log('Auth Microservice is listening on gRPC');
}

bootstrap().catch((error: unknown) => {
  console.error('Error starting Auth Microservice:', error);
  process.exit(1);
});
