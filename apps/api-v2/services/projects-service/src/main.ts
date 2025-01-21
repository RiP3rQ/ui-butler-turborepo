import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ProjectsModule } from './projects.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(ProjectsModule, {
    transport: Transport.GRPC,
    options: {
      package: 'api.projects',
      protoPath: join(
        __dirname,
        '../../../libs/proto/src/proto/projects.proto',
      ),
      url: `${process.env.PROJECTS_SERVICE_HOST ?? 'localhost'}:${process.env.PROJECTS_SERVICE_PORT ?? '3346'}`,
    },
  });

  await app.listen();
  console.log('Projects Microservice is listening on gRPC');
}

bootstrap().catch((error: unknown) => {
  console.error(
    `[ERROR] Error starting projects service: ${JSON.stringify(error)}`,
  );
});
