import type { ProjectDetailsType, ProjectType } from "@repo/types";
import { ApiClient } from "@/lib/api-client";
import type { CreateNewProjectSchemaType } from "@/schemas/project";
import { type GetProjectDetailsRequest } from "@/actions/projects/types";

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
  ): Promise<ProjectType> {
    try {
      const { data } = await ApiClient.post<
        CreateNewProjectSchemaType,
        ProjectType
      >(this.BASE_PATH, {
        body: form,
      });
      return data;
    } catch (error) {
      console.error("Failed to create project:", error);
      throw new Error("Failed to create project");
    }
  }

  /**
   * Fetches project details by ID
   */
  static async getProjectDetails({
    projectId,
  }: Readonly<GetProjectDetailsRequest>): Promise<ProjectDetailsType> {
    try {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      const { data } = await ApiClient.get<ProjectDetailsType>(
        `${this.BASE_PATH}/${encodeURIComponent(projectId)}`,
      );
      return data;
    } catch (error) {
      console.error("Failed to get project details:", error);
      throw new Error("Failed to get project details");
    }
  }

  /**
   * Fetches all projects for the current user
   */
  static async getUserProjects(): Promise<ProjectType[]> {
    try {
      const { data } = await ApiClient.get<ProjectType[]>(this.BASE_PATH);
      return data;
    } catch (error) {
      console.error("Failed to get user projects:", error);
      throw new Error("Failed to get user projects");
    }
  }
}
