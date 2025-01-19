// projects.controller.ts
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProjectsProto } from '@app/proto';
import { ProjectsService } from './projects.service';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @GrpcMethod('ProjectsService', 'GetProjectsByUserId')
  public async getProjectsByUserId(
    request: ProjectsProto.GetProjectsRequest,
  ): Promise<ProjectsProto.GetProjectsResponse> {
    const projects = await this.projectsService.getProjectsByUserId(
      request.user,
    );
    return {
      $type: 'api.projects.GetProjectsResponse',
      projects,
    };
  }

  @GrpcMethod('ProjectsService', 'GetProjectDetails')
  public async getProjectDetails(
    request: ProjectsProto.GetProjectDetailsRequest,
  ): Promise<ProjectsProto.ProjectDetails> {
    return this.projectsService.getProjectDetails(
      request.user,
      request.projectId,
    );
  }

  @GrpcMethod('ProjectsService', 'CreateProject')
  public async createProject(
    request: ProjectsProto.CreateProjectRequest,
  ): Promise<ProjectsProto.Project> {
    return this.projectsService.createProject(request.user, request.project);
  }
}
