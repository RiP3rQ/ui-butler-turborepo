import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  // Optional: Configure global prefix
  app.setGlobalPrefix('api');

  // Optional: Configure CORS
  app.enableCors();

  await app.listen(3339);
}

bootstrap();
