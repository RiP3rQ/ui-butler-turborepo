import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Optional: Configure global prefix
  app.setGlobalPrefix('api');

  // Optional: Configure CORS
  app.enableCors();

  await app.listen(3339);
}

bootstrap();
