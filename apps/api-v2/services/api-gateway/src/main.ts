import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { ConfigService } from '@nestjs/config';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const configService = app.get(ConfigService);

  // Cookie-parser
  app.use(cookieParser());

  // Security
  app.use(helmet());
  app.use(compression());

  // API prefix and CORS
  // app.setGlobalPrefix('api');
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Validation and transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API Gateway')
      .setDescription('API Gateway Documentation')
      .setVersion('2.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  // Start server
  const port = configService.get('PORT', 3333);
  await app.listen(port);

  // Log all registered routes
  const server = app.getHttpServer();
  const router = server._events.request._router;

  console.log('\nRegistered Routes: ');
  router.stack
    .filter((layer: any) => layer.route)
    .forEach((layer: any) => {
      const path = layer.route?.path;
      const methods = Object.keys(layer.route.methods).map((m) =>
        m.toUpperCase(),
      );
      console.log(`${methods.join(', ')} ${path}`);
    });

  console.log(`\nApplication is running on: ${await app.getUrl()}`);
}

bootstrap();
