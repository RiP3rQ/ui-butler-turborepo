import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
