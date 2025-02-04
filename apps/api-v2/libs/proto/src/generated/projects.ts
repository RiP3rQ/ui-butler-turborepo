// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.1
//   protoc               v3.20.3
// source: projects.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { Timestamp } from "./google/protobuf/timestamp";
import { messageTypeRegistry } from "./typeRegistry";

export const protobufPackage = "api.projects";

export interface User {
  $type: "api.projects.User";
  id: number;
  email: string;
  username: string;
}

export interface Project {
  $type: "api.projects.Project";
  id: number;
  title: string;
  description: string;
  color: string;
  createdAt?: Timestamp | undefined;
  updatedAt?: Timestamp | undefined;
  userId: number;
  numberOfComponents?: number | undefined;
}

export interface Component {
  $type: "api.projects.Component";
  id: number;
  title: string;
  code: string;
  projectId: number;
  userId: number;
  isFavorite: boolean;
  createdAt?: Timestamp | undefined;
  updatedAt?: Timestamp | undefined;
}

export interface GetProjectsRequest {
  $type: "api.projects.GetProjectsRequest";
  user?: User | undefined;
}

export interface GetProjectsResponse {
  $type: "api.projects.GetProjectsResponse";
  projects: Project[];
}

export interface GetProjectDetailsRequest {
  $type: "api.projects.GetProjectDetailsRequest";
  user?: User | undefined;
  projectId: number;
}

export interface ProjectDetails {
  $type: "api.projects.ProjectDetails";
  id: number;
  title: string;
  description: string;
  color: string;
  createdAt?: Timestamp | undefined;
  updatedAt?: Timestamp | undefined;
  userId: number;
  numberOfComponents?: number | undefined;
  components: Component[];
  workflows: Workflow[];
}

export interface CreateProjectRequest {
  $type: "api.projects.CreateProjectRequest";
  user?: User | undefined;
  project?: CreateProjectDto | undefined;
}

export interface CreateProjectDto {
  $type: "api.projects.CreateProjectDto";
  title: string;
  description: string;
  color: string;
}

export interface Workflow {
  $type: "api.projects.Workflow";
  id: number;
  name: string;
  projectId: number;
  createdAt?: Timestamp | undefined;
  updatedAt?: Timestamp | undefined;
}

export const API_PROJECTS_PACKAGE_NAME = "api.projects";

function createBaseUser(): User {
  return { $type: "api.projects.User", id: 0, email: "", username: "" };
}

export const User: MessageFns<User, "api.projects.User"> = {
  $type: "api.projects.User" as const,

  encode(
    message: User,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.email !== "") {
      writer.uint32(18).string(message.email);
    }
    if (message.username !== "") {
      writer.uint32(26).string(message.username);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): User {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUser();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.email = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.username = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
};

messageTypeRegistry.set(User.$type, User);

function createBaseProject(): Project {
  return {
    $type: "api.projects.Project",
    id: 0,
    title: "",
    description: "",
    color: "",
    userId: 0,
  };
}

export const Project: MessageFns<Project, "api.projects.Project"> = {
  $type: "api.projects.Project" as const,

  encode(
    message: Project,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.title !== "") {
      writer.uint32(18).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    if (message.color !== "") {
      writer.uint32(34).string(message.color);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(42).fork()).join();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(message.updatedAt, writer.uint32(50).fork()).join();
    }
    if (message.userId !== 0) {
      writer.uint32(56).int32(message.userId);
    }
    if (message.numberOfComponents !== undefined) {
      writer.uint32(64).int32(message.numberOfComponents);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Project {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.title = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.color = reader.string();
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.createdAt = Timestamp.decode(reader, reader.uint32());
          continue;
        }
        case 6: {
          if (tag !== 50) {
            break;
          }

          message.updatedAt = Timestamp.decode(reader, reader.uint32());
          continue;
        }
        case 7: {
          if (tag !== 56) {
            break;
          }

          message.userId = reader.int32();
          continue;
        }
        case 8: {
          if (tag !== 64) {
            break;
          }

          message.numberOfComponents = reader.int32();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
};

messageTypeRegistry.set(Project.$type, Project);

function createBaseComponent(): Component {
  return {
    $type: "api.projects.Component",
    id: 0,
    title: "",
    code: "",
    projectId: 0,
    userId: 0,
    isFavorite: false,
  };
}

export const Component: MessageFns<Component, "api.projects.Component"> = {
  $type: "api.projects.Component" as const,

  encode(
    message: Component,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.title !== "") {
      writer.uint32(18).string(message.title);
    }
    if (message.code !== "") {
      writer.uint32(26).string(message.code);
    }
    if (message.projectId !== 0) {
      writer.uint32(32).int32(message.projectId);
    }
    if (message.userId !== 0) {
      writer.uint32(40).int32(message.userId);
    }
    if (message.isFavorite !== false) {
      writer.uint32(48).bool(message.isFavorite);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(58).fork()).join();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(message.updatedAt, writer.uint32(66).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Component {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseComponent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.title = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.code = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 32) {
            break;
          }

          message.projectId = reader.int32();
          continue;
        }
        case 5: {
          if (tag !== 40) {
            break;
          }

          message.userId = reader.int32();
          continue;
        }
        case 6: {
          if (tag !== 48) {
            break;
          }

          message.isFavorite = reader.bool();
          continue;
        }
        case 7: {
          if (tag !== 58) {
            break;
          }

          message.createdAt = Timestamp.decode(reader, reader.uint32());
          continue;
        }
        case 8: {
          if (tag !== 66) {
            break;
          }

          message.updatedAt = Timestamp.decode(reader, reader.uint32());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
};

messageTypeRegistry.set(Component.$type, Component);

function createBaseGetProjectsRequest(): GetProjectsRequest {
  return { $type: "api.projects.GetProjectsRequest" };
}

export const GetProjectsRequest: MessageFns<
  GetProjectsRequest,
  "api.projects.GetProjectsRequest"
> = {
  $type: "api.projects.GetProjectsRequest" as const,

  encode(
    message: GetProjectsRequest,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).join();
    }
    return writer;
  },

  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): GetProjectsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetProjectsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.user = User.decode(reader, reader.uint32());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
};

messageTypeRegistry.set(GetProjectsRequest.$type, GetProjectsRequest);

function createBaseGetProjectsResponse(): GetProjectsResponse {
  return { $type: "api.projects.GetProjectsResponse", projects: [] };
}

export const GetProjectsResponse: MessageFns<
  GetProjectsResponse,
  "api.projects.GetProjectsResponse"
> = {
  $type: "api.projects.GetProjectsResponse" as const,

  encode(
    message: GetProjectsResponse,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    for (const v of message.projects) {
      Project.encode(v!, writer.uint32(10).fork()).join();
    }
    return writer;
  },

  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): GetProjectsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetProjectsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.projects.push(Project.decode(reader, reader.uint32()));
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
};

messageTypeRegistry.set(GetProjectsResponse.$type, GetProjectsResponse);

function createBaseGetProjectDetailsRequest(): GetProjectDetailsRequest {
  return { $type: "api.projects.GetProjectDetailsRequest", projectId: 0 };
}

export const GetProjectDetailsRequest: MessageFns<
  GetProjectDetailsRequest,
  "api.projects.GetProjectDetailsRequest"
> = {
  $type: "api.projects.GetProjectDetailsRequest" as const,

  encode(
    message: GetProjectDetailsRequest,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).join();
    }
    if (message.projectId !== 0) {
      writer.uint32(16).int32(message.projectId);
    }
    return writer;
  },

  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): GetProjectDetailsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetProjectDetailsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.user = User.decode(reader, reader.uint32());
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }

          message.projectId = reader.int32();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
};

messageTypeRegistry.set(
  GetProjectDetailsRequest.$type,
  GetProjectDetailsRequest,
);

function createBaseProjectDetails(): ProjectDetails {
  return {
    $type: "api.projects.ProjectDetails",
    id: 0,
    title: "",
    description: "",
    color: "",
    userId: 0,
    components: [],
    workflows: [],
  };
}

export const ProjectDetails: MessageFns<
  ProjectDetails,
  "api.projects.ProjectDetails"
> = {
  $type: "api.projects.ProjectDetails" as const,

  encode(
    message: ProjectDetails,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.title !== "") {
      writer.uint32(18).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    if (message.color !== "") {
      writer.uint32(34).string(message.color);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(42).fork()).join();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(message.updatedAt, writer.uint32(50).fork()).join();
    }
    if (message.userId !== 0) {
      writer.uint32(56).int32(message.userId);
    }
    if (message.numberOfComponents !== undefined) {
      writer.uint32(64).int32(message.numberOfComponents);
    }
    for (const v of message.components) {
      Component.encode(v!, writer.uint32(74).fork()).join();
    }
    for (const v of message.workflows) {
      Workflow.encode(v!, writer.uint32(82).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): ProjectDetails {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProjectDetails();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.title = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.color = reader.string();
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.createdAt = Timestamp.decode(reader, reader.uint32());
          continue;
        }
        case 6: {
          if (tag !== 50) {
            break;
          }

          message.updatedAt = Timestamp.decode(reader, reader.uint32());
          continue;
        }
        case 7: {
          if (tag !== 56) {
            break;
          }

          message.userId = reader.int32();
          continue;
        }
        case 8: {
          if (tag !== 64) {
            break;
          }

          message.numberOfComponents = reader.int32();
          continue;
        }
        case 9: {
          if (tag !== 74) {
            break;
          }

          message.components.push(Component.decode(reader, reader.uint32()));
          continue;
        }
        case 10: {
          if (tag !== 82) {
            break;
          }

          message.workflows.push(Workflow.decode(reader, reader.uint32()));
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
};

messageTypeRegistry.set(ProjectDetails.$type, ProjectDetails);

function createBaseCreateProjectRequest(): CreateProjectRequest {
  return { $type: "api.projects.CreateProjectRequest" };
}

export const CreateProjectRequest: MessageFns<
  CreateProjectRequest,
  "api.projects.CreateProjectRequest"
> = {
  $type: "api.projects.CreateProjectRequest" as const,

  encode(
    message: CreateProjectRequest,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).join();
    }
    if (message.project !== undefined) {
      CreateProjectDto.encode(message.project, writer.uint32(18).fork()).join();
    }
    return writer;
  },

  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): CreateProjectRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateProjectRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.user = User.decode(reader, reader.uint32());
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.project = CreateProjectDto.decode(reader, reader.uint32());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
};

messageTypeRegistry.set(CreateProjectRequest.$type, CreateProjectRequest);

function createBaseCreateProjectDto(): CreateProjectDto {
  return {
    $type: "api.projects.CreateProjectDto",
    title: "",
    description: "",
    color: "",
  };
}

export const CreateProjectDto: MessageFns<
  CreateProjectDto,
  "api.projects.CreateProjectDto"
> = {
  $type: "api.projects.CreateProjectDto" as const,

  encode(
    message: CreateProjectDto,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    if (message.color !== "") {
      writer.uint32(26).string(message.color);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): CreateProjectDto {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateProjectDto();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.title = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.description = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.color = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
};

messageTypeRegistry.set(CreateProjectDto.$type, CreateProjectDto);

function createBaseWorkflow(): Workflow {
  return { $type: "api.projects.Workflow", id: 0, name: "", projectId: 0 };
}

export const Workflow: MessageFns<Workflow, "api.projects.Workflow"> = {
  $type: "api.projects.Workflow" as const,

  encode(
    message: Workflow,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.projectId !== 0) {
      writer.uint32(24).int32(message.projectId);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(34).fork()).join();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(message.updatedAt, writer.uint32(42).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Workflow {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWorkflow();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 24) {
            break;
          }

          message.projectId = reader.int32();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.createdAt = Timestamp.decode(reader, reader.uint32());
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.updatedAt = Timestamp.decode(reader, reader.uint32());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
};

messageTypeRegistry.set(Workflow.$type, Workflow);

export interface ProjectsServiceClient {
  getProjectsByUserId(
    request: GetProjectsRequest,
  ): Observable<GetProjectsResponse>;

  getProjectDetails(
    request: GetProjectDetailsRequest,
  ): Observable<ProjectDetails>;

  createProject(request: CreateProjectRequest): Observable<Project>;

  updateProject(request: CreateProjectRequest): Observable<Project>;

  deleteProject(request: GetProjectDetailsRequest): Observable<Project>;
}

export interface ProjectsServiceController {
  getProjectsByUserId(
    request: GetProjectsRequest,
  ):
    | Promise<GetProjectsResponse>
    | Observable<GetProjectsResponse>
    | GetProjectsResponse;

  getProjectDetails(
    request: GetProjectDetailsRequest,
  ): Promise<ProjectDetails> | Observable<ProjectDetails> | ProjectDetails;

  createProject(
    request: CreateProjectRequest,
  ): Promise<Project> | Observable<Project> | Project;

  updateProject(
    request: CreateProjectRequest,
  ): Promise<Project> | Observable<Project> | Project;

  deleteProject(
    request: GetProjectDetailsRequest,
  ): Promise<Project> | Observable<Project> | Project;
}

export function ProjectsServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "getProjectsByUserId",
      "getProjectDetails",
      "createProject",
      "updateProject",
      "deleteProject",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod("ProjectsService", method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcStreamMethod("ProjectsService", method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const PROJECTS_SERVICE_NAME = "ProjectsService";

export interface MessageFns<T, V extends string> {
  readonly $type: V;
  encode(message: T, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): T;
}
