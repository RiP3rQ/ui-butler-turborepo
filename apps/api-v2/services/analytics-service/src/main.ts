import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AnalyticsModule } from './analytics.module';

export async function bootstrap() {
  try {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      AnalyticsModule,
      {
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3347,
        },
      },
    );
    await app.listen();
    console.log('Analytics Microservice is listening');
  } catch (error) {
    console.error('Failed to start microservice:', error);
    throw error;
  }
}

// Only run bootstrap if this file is being executed directly
if (require.main === module) {
  bootstrap().catch((error) => {
    console.error('Bootstrap failed:', error);
    process.exit(1);
  });
}
