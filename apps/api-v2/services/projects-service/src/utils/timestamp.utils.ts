import { dateToTimestamp } from '@microservices/common';
import { type components, type projects } from '@microservices/database';
import { type ProjectsProto } from '@microservices/proto';

type ProjectWithNumberOfComponents = typeof projects.$inferSelect & {
  numberOfComponents: number;
};

type ComponentWithIsFavorite = typeof components.$inferSelect & {
  isFavorite: boolean | null;
  code: string;
};

/**
 * Converts a database project to a gRPC Project message
 */
export function convertToGrpcProject(
  project: ProjectWithNumberOfComponents,
): ProjectsProto.Project {
  return {
    $type: 'api.projects.Project',
    id: project.id,
    title: project.title,
    description: project.description ?? '',
    color: project.color ?? '',
    userId: project.userId,
    numberOfComponents: project.numberOfComponents,
    createdAt: dateToTimestamp(project.createdAt),
    updatedAt: dateToTimestamp(project.updatedAt),
  };
}

/**
 * Converts a database project to a gRPC ProjectDetails message
 */
export function convertToGrpcProjectDetails(
  project: ProjectWithNumberOfComponents,
  components: ComponentWithIsFavorite[] = [],
): ProjectsProto.ProjectDetails {
  return {
    $type: 'api.projects.ProjectDetails',
    id: project.id,
    title: project.title,
    description: project.description ?? '',
    color: project.color ?? '',
    userId: project.userId,
    numberOfComponents: project.numberOfComponents,
    createdAt: dateToTimestamp(project.createdAt),
    updatedAt: dateToTimestamp(project.updatedAt),
    components: components.map(convertToGrpcComponent),
    workflows: [],
  };
}

/**
 * Converts a database component to a gRPC Component message
 */
export function convertToGrpcComponent(
  component: ComponentWithIsFavorite,
): ProjectsProto.Component {
  return {
    $type: 'api.projects.Component',
    id: component.id,
    title: component.title,
    code: component.code,
    projectId: component.projectId,
    userId: component.userId,
    isFavorite: component.isFavorite ?? false,
    createdAt: dateToTimestamp(component.createdAt),
    updatedAt: dateToTimestamp(component.updatedAt),
  };
}
