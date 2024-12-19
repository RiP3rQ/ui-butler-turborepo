import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  components,
  DATABASE_CONNECTION,
  type DrizzleDatabase,
  Project,
  projects,
} from '@app/database';
import { CreateProjectDto, User } from '@app/common';
import { and, eq, sql } from 'drizzle-orm';
import { ProjectDetailsType, ProjectType } from '@repo/types';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  async getProjectsByUserId(user: User): Promise<ProjectType[]> {
    try {
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
        throw new RpcException('Projects not found');
      }

      return userProjects;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async getProjectDetails(
    user: User,
    projectId: number,
  ): Promise<ProjectDetailsType> {
    try {
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
        throw new RpcException('Project not found');
      }

      return {
        ...projectDetails,
        numberOfComponents: componentsForProject.length,
        components: componentsForProject,
      };
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async createProject(
    user: User,
    createProjectDto: CreateProjectDto,
  ): Promise<ProjectType> {
    try {
      const newProjectData: Omit<Project, 'id'> = {
        title: createProjectDto.title,
        description: createProjectDto.description,
        userId: user.id,
        color: createProjectDto.color,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [newProject] = await this.database
        .insert(projects)
        .values(newProjectData)
        .returning();

      if (!newProject) {
        throw new RpcException('Project not created');
      }

      return newProject;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }
}
