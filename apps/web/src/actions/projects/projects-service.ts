import { ApiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/get-error-message";
import { type CreateNewProjectSchemaType } from "@/schemas/project";
import {
  type Project,
  type ProjectDetails,
  type ProjectsEndpoints,
} from "@shared/types";

/**
 * Service class for project-related API calls
 */
export class ProjectsService {
  private static readonly BASE_PATH = "/projects";

  /**
   * Creates a new project
   */
  static async createProject(
    form: Readonly<CreateNewProjectSchemaType>,
  ): Promise<Project> {
    try {
      const response = await ApiClient.post<
        ProjectsEndpoints["createProject"]["body"],
        ProjectsEndpoints["createProject"]["response"]
      >(this.BASE_PATH, {
        body: form,
      });

      if (!response.success) {
        throw new Error("Failed to create project");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create project:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Edits a project
   */
  static async editProject(
    projectId: number,
    form: Readonly<CreateNewProjectSchemaType>,
  ): Promise<Project> {
    try {
      const response = await ApiClient.put<
        ProjectsEndpoints["updateProject"]["body"],
        ProjectsEndpoints["updateProject"]["response"]
      >(`${this.BASE_PATH}/${String(projectId)}`, {
        body: form,
      });

      if (!response.success) {
        throw new Error("Failed to edit project");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to edit project:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Deletes a project
   */
  static async deleteProject(projectId: number): Promise<void> {
    try {
      const response = await ApiClient.delete<
        ProjectsEndpoints["deleteProject"]["response"]
      >(`${this.BASE_PATH}/${String(projectId)}`);

      if (!response.success) {
        throw new Error("Failed to delete project");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches project details by ID
   */
  static async getProjectDetails(
    request: Readonly<ProjectsEndpoints["getProjectDetails"]["request"]>,
  ): Promise<ProjectDetails> {
    try {
      if (!request.projectId) {
        throw new Error("Project ID is required");
      }

      const response = await ApiClient.get<
        ProjectsEndpoints["getProjectDetails"]["response"]
      >(`${this.BASE_PATH}/${String(request.projectId)}`);

      if (!response.success) {
        throw new Error("Failed to get project details");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to get project details:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches all projects for the current user
   */
  static async getUserProjects(): Promise<Project[]> {
    try {
      const response = await ApiClient.get<
        ProjectsEndpoints["getProjects"]["response"]
      >(this.BASE_PATH);

      if (!response.success) {
        throw new Error("Failed to get user projects");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to get user projects:", error);
      throw new Error(getErrorMessage(error));
    }
  }
}
