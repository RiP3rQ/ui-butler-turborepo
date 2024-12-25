import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { CurrentUser, JwtAuthGuard } from '@app/common';
import { ProjectsProto } from '@app/proto';
import { handleGrpcError } from '../utils/grpc-error.util';

interface ProjectsServiceClient {
  getProjectsByUserId(
    request: ProjectsProto.GetProjectsRequest,
  ): Observable<ProjectsProto.GetProjectsResponse>;

  getProjectDetails(
    request: ProjectsProto.GetProjectDetailsRequest,
  ): Observable<ProjectsProto.ProjectDetails>;

  createProject(
    request: ProjectsProto.CreateProjectRequest,
  ): Observable<ProjectsProto.Project>;
}

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController implements OnModuleInit {
  private projectsService: ProjectsServiceClient;

  constructor(
    @Inject('PROJECTS_SERVICE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.projectsService =
      this.client.getService<ProjectsServiceClient>('ProjectsService');
  }

  @Get()
  async getProjectsByUserId(@CurrentUser() user: ProjectsProto.User) {
    try {
      const request: ProjectsProto.GetProjectsRequest = {
        $type: 'api.projects.GetProjectsRequest',
        user: {
          $type: 'api.projects.User',
          id: user.id,
          email: user.email,
          username: user.username,
        },
      };

      const response = await firstValueFrom(
        this.projectsService.getProjectsByUserId(request),
      );

      return response.projects;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Get(':projectId')
  async getProjectDetails(
    @CurrentUser() user: ProjectsProto.User,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    try {
      const request: ProjectsProto.GetProjectDetailsRequest = {
        $type: 'api.projects.GetProjectDetailsRequest',
        user: {
          $type: 'api.projects.User',
          id: user.id,
          email: user.email,
          username: user.username,
        },
        projectId,
      };

      return await firstValueFrom(
        this.projectsService.getProjectDetails(request),
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Post()
  async createProject(
    @CurrentUser() user: ProjectsProto.User,
    @Body() createProjectDto: ProjectsProto.CreateProjectDto,
  ) {
    try {
      const request: ProjectsProto.CreateProjectRequest = {
        $type: 'api.projects.CreateProjectRequest',
        user: {
          $type: 'api.projects.User',
          id: user.id,
          email: user.email,
          username: user.username,
        },
        project: {
          $type: 'api.projects.CreateProjectDto',
          ...createProjectDto,
        },
      };

      return await firstValueFrom(this.projectsService.createProject(request));
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
