import { Module } from '@nestjs/common';
import { ComponentsController } from './components.controller';
import { ComponentsService } from './components.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  controllers: [ComponentsController],
  providers: [ComponentsService],
})
export class ComponentsModule {}
