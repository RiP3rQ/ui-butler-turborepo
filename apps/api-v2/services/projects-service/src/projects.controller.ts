import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, User } from '@app/common';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @MessagePattern('projects.get-all')
  async getProjectsByUserId(@Payload() data: { user: User }) {
    return this.projectsService.getProjectsByUserId(data.user);
  }

  @MessagePattern('projects.get-details')
  async getProjectDetails(@Payload() data: { user: User; projectId: number }) {
    return this.projectsService.getProjectDetails(data.user, data.projectId);
  }

  @MessagePattern('projects.create')
  async createProject(
    @Payload() data: { user: User; createProjectDto: CreateProjectDto },
  ) {
    return this.projectsService.createProject(data.user, data.createProjectDto);
  }
}
