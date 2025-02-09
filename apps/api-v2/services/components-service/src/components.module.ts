import { GrpcErrorInterceptor } from '@microservices/common';
import { DatabaseModule } from '@microservices/database';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ComponentsController } from './components.controller';
import { ComponentsService } from './components.service';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        COMPONENTS_SERVICE_HOST: Joi.string().required(),
        COMPONENTS_SERVICE_PORT: Joi.number().required(),
        COMPONENTS_SERVICE_HTTP_PORT: Joi.number().required(),
        GOOGLE_GENERATIVE_AI_API_KEY: Joi.string().required(),
      }),
    }),
  ],
  controllers: [ComponentsController],
  providers: [
    ComponentsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcErrorInterceptor,
    },
  ],
})
export class ComponentsModule {}
