import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateProjectDto,
  CurrentUser,
  JwtAuthGuard,
  type User,
} from '@app/common';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    @Inject('PROJECTS_SERVICE') private readonly projectsClient: ClientProxy,
  ) {}

  @Get()
  async getProjectsByUserId(@CurrentUser() user: User) {
    return firstValueFrom(
      this.projectsClient.send('projects.get-all', { user }),
    );
  }

  @Get(':projectId')
  async getProjectDetails(
    @CurrentUser() user: User,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return firstValueFrom(
      this.projectsClient.send('projects.get-details', { user, projectId }),
    );
  }

  @Post()
  async createProject(
    @CurrentUser() user: User,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return firstValueFrom(
      this.projectsClient.send('projects.create', { user, createProjectDto }),
    );
  }
}
