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
    return await this.projectsService.getProjectsByUserId(request);
  }

  @GrpcMethod('ProjectsService', 'GetProjectDetails')
  public async getProjectDetails(
    request: ProjectsProto.GetProjectDetailsRequest,
  ): Promise<ProjectsProto.ProjectDetails> {
    return await this.projectsService.getProjectDetails(request);
  }

  @GrpcMethod('ProjectsService', 'CreateProject')
  public async createProject(
    request: ProjectsProto.CreateProjectRequest,
  ): Promise<ProjectsProto.Project> {
    return await this.projectsService.createProject(request);
  }
}
