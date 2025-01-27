import * as fs from 'node:fs';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression, { filter } from 'compression';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { ApiGatewayModule } from './api-gateway.module';
// import { HttpExceptionFilter } from './filters/http-exception.filter';
import { EnhancedResponseInterceptor } from './interceptors/enhanced-response.interceptor';
import { MetricsInterceptor } from './metrics/metrics.interceptor';
import { MetricsService } from './metrics/metrics.service';
import { PerformanceMetrics } from './metrics/performance.metrics';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, {
    bufferLogs: true,
    // Enable HTTPS in production
    httpsOptions:
      process.env.NODE_ENV === 'production'
        ? {
            key: fs.readFileSync(String(process.env.SSL_KEY_PATH)),
            cert: fs.readFileSync(String(process.env.SSL_CERT_PATH)),
          }
        : undefined,
  });

  // Logger and request logging
  app.useLogger(app.get(Logger));

  // Get ConfigService instance
  const configService = app.get(ConfigService);

  // Cookie-parser
  app.use(cookieParser());

  // Security
  // Enhanced security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      dnsPrefetchControl: true,
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: true,
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    }),
  );
  // + HelmetMiddleware

  // Compression
  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return filter(req, res);
      },
      level: 6, // compression level (0-9)
      threshold: 100 * 1024, // only compress responses bigger than 100kb
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Enhanced CORS configuration
  app.enableCors({
    origin: configService
      .get<string>('ALLOWED_ORIGINS', 'http://localhost:3000')
      .split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    credentials: true,
    maxAge: 3600,
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
  // app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new EnhancedResponseInterceptor(),
    // Add metrics interceptor
    new MetricsInterceptor(app.get(MetricsService)),
  );

  // Get PerformanceMetrics instance
  const performanceMetrics = app.get(PerformanceMetrics);

  // Monitor memory usage every 30 seconds
  setInterval(() => {
    performanceMetrics.updateMemoryUsage();
  }, 30000);

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
  const port = Number(configService.getOrThrow('PORT', 3333));
  await app.listen(port);

  // Log all registered routes FOR DEBUGGING
  // const server = app.getHttpServer();
  // const router = server._events.request._router;
  // console.log('\nRegistered Routes: ');
  // router.stack
  //   .filter((layer: any) => layer.route)
  //   .forEach((layer: any) => {
  //     const path = layer.route?.path;
  //     const methods = Object.keys(layer.route.methods).map((m) =>
  //       m.toUpperCase(),
  //     );
  //     console.log(`${methods.join(', ')} ${path}`);
  //   });

  console.log(`\nApplication is running on: ${await app.getUrl()}`);
}

bootstrap().catch((error: unknown) => {
  console.error('Error starting api-gateway:', JSON.stringify(error));
  process.exit(1);
});
