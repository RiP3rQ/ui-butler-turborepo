import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { join } from 'node:path';
import { ComponentsModule } from './components.module';

async function bootstrap() {
  // Create a hybrid application (HTTP + Microservice)
  const app = await NestFactory.create(ComponentsModule);

  // Configure ports
  const HTTP_PORT = parseInt(
    process.env.COMPONENTS_SERVICE_HTTP_PORT ?? '3348',
    10,
  );
  const GRPC_PORT = parseInt(process.env.COMPONENTS_SERVICE_PORT ?? '3345', 10);

  // Add microservice capabilities
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'api.components',
      protoPath: join(
        __dirname,
        '../../../libs/proto/src/proto/components.proto',
      ),
      url: `${process.env.COMPONENTS_SERVICE_HOST ?? 'localhost'}:${String(GRPC_PORT)}`,
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

  // Get and display routes <-- WORKS FOR NEST.JS v10 BUT NOT v11 (deprecated)
  // const server = app.getHttpServer() as Express;
  // await app.init(); // Initialize the application to get the router
  // // @ts-expect-error This works but is not typed
  // const router = server._events.request._router as Router;
  // console.log('\nRegistered Routes:');
  // console.log('router', router);
  // router.stack
  //   .filter((layer) => layer.route)
  //   .forEach((layer) => {
  //     const path = layer.route?.path ?? '';
  //     // @ts-expect-error This works but is not typed
  //     const methods = Object.keys(layer.route?.methods ?? {}).map((m) =>
  //       m.toUpperCase(),
  //     );
  //     console.log(`${methods.join(', ')} ${String(path)}`);
  //   });

  // Start both HTTP and Microservice
  await app.startAllMicroservices();
  console.log(`Microservice is listening on port ${String(GRPC_PORT)}`);
  await app.listen(HTTP_PORT);
  console.log(`Components Service is running on port ${String(HTTP_PORT)}`);
}

bootstrap().catch((error: unknown) => {
  console.error('Error starting Components Microservice:', error);
  process.exit(1);
});

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
