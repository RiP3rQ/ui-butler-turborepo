"use server";

import {
  type Project,
  type ProjectDetails,
  type ProjectsEndpoints,
} from "@shared/types";
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
 * Edits a project
 */
export async function editProjectFunction(
  projectId: number,
  form: Readonly<CreateNewProjectSchemaType>,
): Promise<Project> {
  // Validate input before processing
  const validatedForm = await validateProjectInput(form);
  return ProjectsService.editProject(projectId, validatedForm);
}

/**
 * Deletes a project
 */
export async function deleteProjectFunction(projectId: number): Promise<void> {
  return ProjectsService.deleteProject(projectId);
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
