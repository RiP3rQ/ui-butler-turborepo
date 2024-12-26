import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ComponentsModule } from './components.module';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { join } from 'path';

async function bootstrap() {
  // Create a hybrid application (HTTP + Microservice)
  const app = await NestFactory.create(ComponentsModule);

  // Configure ports
  const HTTP_PORT =
    parseInt(process.env.COMPONENTS_SERVICE_HTTP_PORT, 10) || 3348;
  const GRPC_PORT = parseInt(process.env.COMPONENTS_SERVICE_PORT, 10) || 3345;

  // Add microservice capabilities
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'api.components',
      protoPath: join(
        __dirname,
        '../../../libs/proto/src/proto/components.proto',
      ),
      url: `${process.env.COMPONENTS_SERVICE_HOST || 'localhost'}:${GRPC_PORT || '3345'}`,
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
  console.log(`Microservice is listening on port ${GRPC_PORT}`);
  await app.listen(HTTP_PORT);
  console.log(`Components Service is running on port ${HTTP_PORT}`);
}

bootstrap();

// FOR DEBUGGING PURPOSES -->

// Add error handling for proto file loading
// try {
//   // Get and display routes
//   const server = app.getHttpServer();
//   await app.init(); // Initialize the application to get the router
//   const router = server._events.request._router;
//   console.log('\nRegistered Routes:');
//   router.stack
//     .filter((layer: any) => layer.route)
//     .forEach((layer: any) => {
//       const path = layer.route?.path;
//       const methods = Object.keys(layer.route.methods).map((m) =>
//         m.toUpperCase(),
//       );
//       console.log(`${methods.join(', ')} ${path}`);
//     });
//
//   // Verify proto file exists
//   const protoPath = join(
//     __dirname,
//     '../../../libs/proto/src/proto/components.proto',
//   );
//   const fs = require('fs');
//   if (!fs.existsSync(protoPath)) {
//     throw new Error(`Proto file not found at path: ${protoPath}`);
//   }
//   console.log('Proto file found at:', protoPath);
//
//   // Start both HTTP and Microservice
//   await app.startAllMicroservices();
//   console.log(`gRPC Microservice is listening on port ${GRPC_PORT}`);
//   await app.listen(HTTP_PORT);
//   console.log(`HTTP Service is running on port ${HTTP_PORT}`);
// } catch (error) {
//   console.error('Bootstrap error:', error);
//   process.exit(1);
// }
