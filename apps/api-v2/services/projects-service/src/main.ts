import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ProjectsModule } from './projects.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProjectsModule,
    {
      transport: Transport.TCP, // or Transport.REDIS, Transport.KAFKA, etc.
      options: {
        host: process.env.PROJECTS_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.PROJECTS_SERVICE_PORT, 10) || 3343,
      },
    },
  );
  await app.listen();
  console.log('Projects Microservice is listening');
}

bootstrap();
