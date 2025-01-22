import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from '@app/database';
import { GrpcErrorInterceptor } from '@app/common';
import { ComponentsService } from './components.service';
import { ComponentsController } from './components.controller';

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
