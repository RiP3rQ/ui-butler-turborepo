import { Module } from '@nestjs/common';
import { ComponentsService } from './components.service';
import { ComponentsController } from './components.controller';
import { DatabaseModule } from '../database/database.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [ComponentsController],
  providers: [ComponentsService, JwtAuthGuard],
})
export class ComponentsModule {}
