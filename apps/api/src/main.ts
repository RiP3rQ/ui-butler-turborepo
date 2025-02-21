import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: true, // or specify your frontend URL
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(app.get(ConfigService).getOrThrow('PORT'));
}

bootstrap().then(() => {
  console.log('API is running');
});
