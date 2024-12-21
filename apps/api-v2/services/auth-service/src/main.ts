import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';

export async function bootstrap() {
  try {
    const port = parseInt(process.env.AUTH_SERVICE_PORT || '3340');
    const host = process.env.AUTH_SERVICE_HOST || 'localhost';

    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      AuthModule,
      {
        transport: Transport.TCP,
        options: {
          host,
          port: isNaN(port) ? 3340 : port,
        },
      },
    );
    await app.listen();
    console.log('Auth Microservice is listening');
  } catch (error) {
    console.error('Failed to start Auth Microservice:', error);
    throw error;
  }
}

export function handleBootstrapError(error: Error): never {
  console.error('Bootstrap failed:', error);
  return process.exit(1);
}

// Create a separate function for initialization
export function init(): void {
  if (require.main === module) {
    bootstrap().catch(handleBootstrapError);
  }
}

// Call init
init();
