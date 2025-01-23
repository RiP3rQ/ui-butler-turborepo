"use server";

import {
  type Project,
  type ProjectDetails,
  type ProjectsEndpoints,
} from "@shared/types/src/api-client/projects-endpoints";
import {
  type CreateNewProjectSchemaType,
  validateProjectInput,
} from "@/schemas/project";
import { ProjectsService } from "@/actions/projects/projects-service";

/**
 * Creates a new project
 */
export async function createNewProjectFunction(
  form: Readonly<CreateNewProjectSchemaType>,
): Promise<Project> {
  // Validate input before processing
  const validatedForm = await validateProjectInput(form);
  return ProjectsService.createProject(validatedForm);
}

/**
 * Fetches project details
 */
export async function getProjectsDetailsFunction(
  request: Readonly<ProjectsEndpoints["getProjectDetails"]["request"]>,
): Promise<ProjectDetails> {
  return ProjectsService.getProjectDetails(request);
}

/**
 * Fetches all user projects
 */
export async function getUserProjects(): Promise<Project[]> {
  return ProjectsService.getUserProjects();
}
