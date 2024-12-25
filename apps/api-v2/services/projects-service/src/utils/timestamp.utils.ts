import { ProjectsProto, Timestamp } from '@app/proto';

export function dateToTimestamp(date: Date): Timestamp {
  return {
    $type: 'google.protobuf.Timestamp',
    seconds: Math.floor(date.getTime() / 1000),
    nanos: (date.getTime() % 1000) * 1000000,
  };
}

export function convertToGrpcProject(project: any): ProjectsProto.Project {
  return {
    $type: 'api.projects.Project',
    id: project.id,
    title: project.title,
    description: project.description,
    color: project.color,
    userId: project.userId,
    numberOfComponents: project.numberOfComponents,
    createdAt: dateToTimestamp(project.createdAt),
    updatedAt: dateToTimestamp(project.updatedAt),
  };
}

export function convertToGrpcComponent(
  component: any,
): ProjectsProto.Component {
  return {
    $type: 'api.projects.Component',
    id: component.id,
    title: component.title,
    description: component.description,
    projectId: component.projectId,
    userId: component.userId,
    isFavorite: component.isFavorite,
    createdAt: dateToTimestamp(component.createdAt),
    updatedAt: dateToTimestamp(component.updatedAt),
  };
}
