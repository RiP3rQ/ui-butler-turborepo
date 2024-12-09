import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import type { DrizzleDatabase } from '../database/merged-schemas';
import { User } from '../database/schemas/users';
import { CreateProjectDto } from './dto/create-new-project.dto';
import { NewProject, projects } from '../database/schemas/projects';
import { eq } from 'drizzle-orm';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  // Get /projects
  async getProjectsByUserId(user: User) {
    const userProjects = await this.database
      .select()
      .from(projects)
      .where(eq(projects.userId, user.id));

    if (!userProjects) {
      throw new NotFoundException('Projects not found');
    }

    return userProjects;
  }

  // POST /workflows
  async createProject(user: User, createProjectDto: CreateProjectDto) {
    const newProjectData = {
      title: createProjectDto.title,
      description: createProjectDto.description,
      userId: user.id,
      color: createProjectDto.color,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as NewProject;

    const [newProject] = await this.database
      .insert(projects)
      .values(newProjectData)
      .returning();

    if (!newProject) {
      throw new NotFoundException('Project not created');
    }

    return newProject;
  }
}
