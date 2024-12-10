import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { LogErrors } from '../common/error-handling/log-errors.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { User } from '../database/schemas/users';
import { CreateProjectDto } from './dto/create-new-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('/')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getProjectsByUserId(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    return this.projectsService.getProjectsByUserId(user);
  }

  @Get(':projectId')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getProjectDetails(
    @CurrentUser() user: User,
    @Param(
      'projectId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    projectId: number,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    return this.projectsService.getProjectDetails(user, projectId);
  }

  @Post()
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  createProject(
    @CurrentUser() user: User,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return this.projectsService.createProject(user, createProjectDto);
  }
}
