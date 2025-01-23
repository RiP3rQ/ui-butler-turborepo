import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import type { DrizzleDatabase } from '../database/merged-schemas';
import { User } from '../database/schemas/users';
import { CreateProjectDto } from './dto/create-new-project.dto';
import { NewProject, projects } from '../database/schemas/projects';
import { and, eq, sql } from 'drizzle-orm';
import { ProjectDetailsType, type ProjectType } from '@shared/types';
import { components } from '../database/schemas/components';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  // Get /projects
  async getProjectsByUserId(user: User) {
    const userProjects = await this.database
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        color: projects.color,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        userId: projects.userId,
        numberOfComponents: sql<number>`COUNT(
        ${components.id}
        )`,
      })
      .from(projects)
      .leftJoin(components, eq(components.projectId, projects.id))
      .where(eq(projects.userId, user.id))
      .groupBy(projects.id);

    if (!userProjects) {
      throw new NotFoundException('Projects not found');
    }

    return userProjects satisfies ProjectType[];
  }

  // GET /projects/:projectId
  async getProjectDetails(user: User, projectId: number) {
    const [projectDetails, componentsForProject] = await Promise.all([
      this.database
        .select()
        .from(projects)
        .where(and(eq(projects.userId, user.id), eq(projects.id, projectId)))
        .then((rows) => rows[0]),

      this.database
        .select()
        .from(components)
        .where(
          and(
            eq(components.userId, user.id),
            eq(components.projectId, projectId),
          ),
        ),
    ]);

    if (!projectDetails) {
      throw new NotFoundException('Project not found');
    }

    return {
      ...projectDetails,
      numberOfComponents: componentsForProject.length,
      components: componentsForProject,
    } satisfies ProjectDetailsType;
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
