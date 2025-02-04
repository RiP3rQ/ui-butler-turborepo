// projects.controller.ts
import { ProjectsProto } from '@microservices/proto';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
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

  @GrpcMethod('ProjectsService', 'UpdateProject')
  public async updateProject(
    request: ProjectsProto.CreateProjectRequest,
  ): Promise<ProjectsProto.Project> {
    return await this.projectsService.updateProject(request);
  }

  @GrpcMethod('ProjectsService', 'DeleteProject')
  public async deleteProject(
    request: ProjectsProto.GetProjectDetailsRequest,
  ): Promise<ProjectsProto.Project> {
    return await this.projectsService.deleteProject(request);
  }
}
