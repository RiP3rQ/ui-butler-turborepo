import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ComponentsModule } from './components.module';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // Create a hybrid application (HTTP + Microservice)
  const app = await NestFactory.create(ComponentsModule);

  // Configure ports
  const HTTP_PORT =
    parseInt(process.env.COMPONENTS_SERVICE_HTTP_PORT, 10) || 3347;
  const TCP_PORT = parseInt(process.env.COMPONENTS_SERVICE_PORT, 10) || 3345;

  // Add microservice capabilities
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: process.env.COMPONENTS_SERVICE_HOST || 'localhost',
      port: TCP_PORT,
    },
  });

  // Cookie-parser
  app.use(cookieParser());

  // Security
  app.use(helmet());
  app.use(compression());

  // Enable CORS if needed
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Get and display routes
  const server = app.getHttpServer();
  await app.init(); // Initialize the application to get the router
  const router = server._events.request._router;
  console.log('\nRegistered Routes:');
  router.stack
    .filter((layer: any) => layer.route)
    .forEach((layer: any) => {
      const path = layer.route?.path;
      const methods = Object.keys(layer.route.methods).map((m) =>
        m.toUpperCase(),
      );
      console.log(`${methods.join(', ')} ${path}`);
    });

  // Start both HTTP and Microservice
  await app.startAllMicroservices();
  await app.listen(HTTP_PORT);

  console.log(`Components Service is running on port ${HTTP_PORT}`);
  console.log(`Microservice is listening on port ${TCP_PORT}`);
}

bootstrap();
