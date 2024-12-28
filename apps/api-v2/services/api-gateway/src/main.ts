import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { EnhancedResponseInterceptor } from './interceptors/enhanced-response.interceptor';
import { Logger } from 'nestjs-pino';
import { MetricsService } from './metrics/metrics.service';
import { MetricsInterceptor } from './metrics/metrics.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);

  // Cookie-parser
  app.use(cookieParser());

  // Security
  // helmet is being handled by the HelmetMiddleware
  app.use(compression());

  // API prefix and CORS
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true, // or specify your frontend URL
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
  app.useGlobalInterceptors(new EnhancedResponseInterceptor());

  // Add metrics interceptor
  const metricsService = app.get(MetricsService);
  app.useGlobalInterceptors(new MetricsInterceptor(metricsService));

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('UI Butler API')
      .setDescription('UI Butler API Gateway Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'UI Butler API Documentation',
    });
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  // Start server
  const port = configService.get('PORT', 3333);
  await app.listen(port);

  // Log all registered routes FOR DEBUGGING
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
