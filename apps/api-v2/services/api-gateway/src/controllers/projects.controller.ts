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
import { CurrentUser, JwtAuthGuard } from '@app/common';
import { ProjectsProto } from '@app/proto';
import { handleGrpcError } from '../utils/grpc-error.util';
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController implements OnModuleInit {
  private projectsService: ProjectsProto.ProjectsServiceClient;

  constructor(
    @Inject('PROJECTS_SERVICE') private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
  ) {}

  onModuleInit() {
    this.projectsService =
      this.client.getService<ProjectsProto.ProjectsServiceClient>(
        'ProjectsService',
      );
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

      const response = await this.grpcClient.call(
        this.projectsService.getProjectsByUserId(request),
        'Projects.getProjectsByUserId',
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

      return await this.grpcClient.call(
        this.projectsService.getProjectDetails(request),
        'Projects.getProjectDetails',
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

      return await this.grpcClient.call(
        this.projectsService.createProject(request),
        'Projects.createProject',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
