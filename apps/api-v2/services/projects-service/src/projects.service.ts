// projects.service.ts
import {
  and,
  components,
  DATABASE_CONNECTION,
  type DrizzleDatabase,
  eq,
  type Project,
  projects,
  sql,
} from '@microservices/database';
import { status } from '@grpc/grpc-js';
import { type ProjectsProto } from '@microservices/proto';
import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  convertToGrpcProject,
  convertToGrpcProjectDetails,
} from './utils/timestamp.utils';
import { dateToTimestamp } from '@microservices/common';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  public async getProjectsByUserId(
    request: ProjectsProto.GetProjectsRequest,
  ): Promise<ProjectsProto.GetProjectsResponse> {
    try {
      if (!request.user) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        });
      }

      const userProjects = await this.database
        .select({
          id: projects.id,
          title: projects.title,
          description: projects.description,
          color: projects.color,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          userId: projects.userId,
          numberOfComponents: sql<number>`COUNT(${components.id})`,
        })
        .from(projects)
        .leftJoin(components, eq(components.projectId, projects.id))
        .where(eq(projects.userId, request.user.id))
        .groupBy(projects.id);

      return {
        $type: 'api.projects.GetProjectsResponse',
        projects: userProjects.map(convertToGrpcProject),
      };
    } catch (error: unknown) {
      console.error(
        `[ERROR] Error getting projects by user id: ${JSON.stringify(error)}`,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async getProjectDetails(
    request: ProjectsProto.GetProjectDetailsRequest,
  ): Promise<ProjectsProto.ProjectDetails> {
    try {
      if (!request.user) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        });
      }

      const [projectDetails, projectComponents] = await Promise.all([
        this.database
          .select({
            id: projects.id,
            title: projects.title,
            description: projects.description,
            color: projects.color,
            createdAt: projects.createdAt,
            updatedAt: projects.updatedAt,
            userId: projects.userId,
            numberOfComponents: sql<number>`COUNT(${components.id})`,
          })
          .from(projects)
          .leftJoin(components, eq(components.projectId, projects.id))
          .where(
            and(
              eq(projects.userId, request.user.id),
              eq(projects.id, request.projectId),
            ),
          )
          .groupBy(projects.id)
          .then((rows) => rows[0]),

        this.database
          .select()
          .from(components)
          .where(
            and(
              eq(components.userId, request.user.id),
              eq(components.projectId, request.projectId),
            ),
          ),
      ]);

      if (!projectDetails) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Project not found',
        });
      }

      return convertToGrpcProjectDetails(projectDetails, projectComponents);
    } catch (error: unknown) {
      console.error(
        `[ERROR] Error getting project details: ${JSON.stringify(error)}`,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async createProject(
    request: ProjectsProto.CreateProjectRequest,
  ): Promise<ProjectsProto.Project> {
    try {
      if (!request.user || !request.project) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Invalid request',
        });
      }

      const now = new Date();
      const newProjectData: Omit<Project, 'id'> = {
        title: request.project.title,
        description: request.project.description,
        userId: request.user.id,
        color: request.project.color,
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
    } catch (error: unknown) {
      console.error(`[ERROR] Error creating project: ${JSON.stringify(error)}`);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async updateProject(
    request: ProjectsProto.UpdateProjectRequest,
  ): Promise<ProjectsProto.Project> {
    try {
      if (!request.user || !request.project) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Invalid request',
        });
      }

      const now = new Date();
      const updatedProjectData = {
        title: request.project.title,
        description: request.project.description,
        color: request.project.color,
        updatedAt: now,
      };

      const [updatedProject] = await this.database
        .update(projects)
        .set(updatedProjectData)
        .where(
          and(
            eq(projects.userId, request.user.id),
            eq(projects.id, request.projectId),
          ),
        )
        .returning();

      if (!updatedProject) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Project not found',
        });
      }

      return convertToGrpcProject({
        ...updatedProject,
        numberOfComponents: 0,
      });
    } catch (error: unknown) {
      console.error(`[ERROR] Error updating project: ${JSON.stringify(error)}`);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async deleteProject(
    request: ProjectsProto.GetProjectDetailsRequest,
  ): Promise<ProjectsProto.Project> {
    try {
      if (!request.user || !request.projectId) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Invalid request',
        });
      }

      const [deletedProject] = await this.database
        .delete(projects)
        .where(
          and(
            eq(projects.userId, request.user.id),
            eq(projects.id, request.projectId),
          ),
        )
        .returning();

      if (!deletedProject) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Project not found',
        });
      }

      return {
        $type: 'api.projects.Project',
        id: deletedProject.id,
        title: deletedProject.title ?? '',
        description: deletedProject.description ?? '',
        color: deletedProject.color ?? '',
        createdAt: dateToTimestamp(deletedProject.createdAt),
        updatedAt: dateToTimestamp(deletedProject.updatedAt),
        userId: deletedProject.userId,
      };
    } catch (error: unknown) {
      console.error(`[ERROR] Error deleting project: ${JSON.stringify(error)}`);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }
}
