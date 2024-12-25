// projects.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import {
  and,
  components,
  DATABASE_CONNECTION,
  type DrizzleDatabase,
  eq,
  Project,
  projects,
  sql,
} from '@app/database';
import { ProjectsProto } from '@app/proto';
import {
  convertToGrpcComponent,
  convertToGrpcProject,
  dateToTimestamp,
} from './utils/timestamp.utils';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  async getProjectsByUserId(
    user: ProjectsProto.User,
  ): Promise<ProjectsProto.Project[]> {
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
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Projects not found',
        });
      }

      return userProjects.map((project) => convertToGrpcProject(project));
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  async getProjectDetails(
    user: ProjectsProto.User,
    projectId: number,
  ): Promise<ProjectsProto.ProjectDetails> {
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
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Project not found',
        });
      }

      return {
        $type: 'api.projects.ProjectDetails',
        id: projectDetails.id,
        title: projectDetails.title,
        description: projectDetails.description,
        color: projectDetails.color,
        userId: projectDetails.userId,
        createdAt: dateToTimestamp(projectDetails.createdAt),
        updatedAt: dateToTimestamp(projectDetails.updatedAt),
        numberOfComponents: componentsForProject.length,
        components: componentsForProject.map((component) =>
          convertToGrpcComponent(component),
        ),
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  async createProject(
    user: ProjectsProto.User,
    createProjectDto: ProjectsProto.CreateProjectDto,
  ): Promise<ProjectsProto.Project> {
    try {
      const now = new Date();
      const newProjectData: Omit<Project, 'id'> = {
        title: createProjectDto.title,
        description: createProjectDto.description,
        userId: user.id,
        color: createProjectDto.color,
        createdAt: now,
        updatedAt: now,
      };

      const [newProject] = await this.database
        .insert(projects)
        .values(newProjectData)
        .returning();

      if (!newProject) {
        throw new RpcException({
          code: status.INTERNAL,
          message: 'Project not created',
        });
      }

      return convertToGrpcProject({
        ...newProject,
        numberOfComponents: 0,
      });
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }
}
