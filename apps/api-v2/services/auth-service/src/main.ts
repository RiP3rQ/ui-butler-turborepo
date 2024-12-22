import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';
import { AUTH_V1_PACKAGE_NAME } from '@app/proto';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

export async function bootstrap() {
  try {
    const app = await NestFactory.createMicroservice(AuthModule, {
      transport: Transport.GRPC,
      options: {
        package: AUTH_V1_PACKAGE_NAME,
        protoPath: join(
          __dirname,
          '../../../libs/proto/src/auth/v1/auth.proto',
        ),
        url: `${process.env.AUTH_SERVICE_HOST || 'localhost'}:${process.env.AUTH_SERVICE_PORT || '5000'}`,
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
  } catch (error) {
    console.error('Failed to start Auth Microservice:', error);
    throw error;
  }
}

export function handleBootstrapError(error: Error): never {
  console.error('Bootstrap failed:', error);
  return process.exit(1);
}

export function init(): void {
  if (require.main === module) {
    bootstrap().catch(handleBootstrapError);
  }
}

init();
