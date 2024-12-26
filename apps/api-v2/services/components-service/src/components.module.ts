import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ComponentsController } from './components.controller';
import { ComponentsService } from './components.service';
import { DatabaseModule } from '@app/database';
import { GrpcErrorInterceptor } from '@app/common';

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
