import { GrpcErrorInterceptor } from '@microservices/common';
import { DatabaseModule } from '@microservices/database';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ComponentsController } from './components.controller';
import { ComponentsService } from './components.service';

@Module({
  imports: [DatabaseModule],
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
