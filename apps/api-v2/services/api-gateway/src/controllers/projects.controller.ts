import { CurrentUser, JwtAuthGuard } from '@app/common';
import { ProjectsProto } from '@microservices/proto';
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
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';
import { handleGrpcError } from '../utils/grpc-error.util';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController implements OnModuleInit {
  private projectsService: ProjectsProto.ProjectsServiceClient;

  constructor(
    @Inject('PROJECTS_SERVICE') private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
  ) {}

  public onModuleInit(): void {
    this.projectsService =
      this.client.getService<ProjectsProto.ProjectsServiceClient>(
        'ProjectsService',
      );
  }

  @Get()
  public async getProjectsByUserId(
    @CurrentUser() user: ProjectsProto.User,
  ): Promise<ProjectsProto.Project[]> {
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
  public async getProjectDetails(
    @CurrentUser() user: ProjectsProto.User,
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<ProjectsProto.ProjectDetails> {
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
  public async createProject(
    @CurrentUser() user: ProjectsProto.User,
    @Body() createProjectDto: ProjectsProto.CreateProjectDto,
  ): Promise<ProjectsProto.Project> {
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
