"use server";

import type { ProjectDetailsType, ProjectType } from "@repo/types";
import {
  type CreateNewProjectSchemaType,
  validateProjectInput,
} from "@/schemas/project";
import { ProjectsService } from "@/actions/projects/projects-service";
import { type GetProjectDetailsRequest } from "@/actions/projects/types";

/**
 * Creates a new project
 */
export async function createNewProjectFunction(
  form: Readonly<CreateNewProjectSchemaType>,
): Promise<ProjectType> {
  // Validate input before processing
  const validatedForm = await validateProjectInput(form);
  return ProjectsService.createProject(validatedForm);
}

/**
 * Fetches project details
 */
export async function getProjectsDetailsFunction(
  request: Readonly<GetProjectDetailsRequest>,
): Promise<ProjectDetailsType> {
  return ProjectsService.getProjectDetails(request);
}

/**
 * Fetches all user projects
 */
export async function getUserProjects(): Promise<ProjectType[]> {
  return ProjectsService.getUserProjects();
}
