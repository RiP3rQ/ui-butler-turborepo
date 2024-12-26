// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.0
//   protoc               v3.20.3
// source: execution.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { messageTypeRegistry } from "./typeRegistry";

export const protobufPackage = "api.execution";

export interface User {
  $type: "api.execution.User";
  id: string;
  email: string;
}

export interface GetPendingChangesRequest {
  $type: "api.execution.GetPendingChangesRequest";
  user?: User | undefined;
  executionId: number;
}

export interface PendingChangesResponse {
  $type: "api.execution.PendingChangesResponse";
  pendingApproval: { [key: string]: string };
  status: string;
}

export interface PendingChangesResponse_PendingApprovalEntry {
  $type: "api.execution.PendingChangesResponse.PendingApprovalEntry";
  key: string;
  value: string;
}

export interface ApproveChangesRequest {
  $type: "api.execution.ApproveChangesRequest";
  user?: User | undefined;
  executionId: number;
  body?: ApproveChangesBody | undefined;
}

export interface ApproveChangesBody {
  $type: "api.execution.ApproveChangesBody";
  decision: string;
  comment: string;
}

export interface ApproveChangesResponse {
  $type: "api.execution.ApproveChangesResponse";
  message: string;
  status: string;
}

export interface ExecuteWorkflowRequest {
  $type: "api.execution.ExecuteWorkflowRequest";
  workflowExecutionId: number;
  componentId: number;
  nextRunAt?: string | undefined;
}

export interface Empty {
  $type: "api.execution.Empty";
}

/** Additional messages for complex types */
export interface WorkflowExecution {
  $type: "api.execution.WorkflowExecution";
  id: number;
  workflowId: number;
  userId: string;
  status: string;
  startedAt: string;
  endedAt: string;
  trigger: string;
  definition: string;
  workflow?: Workflow | undefined;
  executionPhases: ExecutionPhase[];
}

export interface Workflow {
  $type: "api.execution.Workflow";
  id: number;
  name: string;
  description: string;
  userId: string;
  definition: string;
  status: string;
  executionPlan: string;
  creditsCost: number;
}

export interface ExecutionPhase {
  $type: "api.execution.ExecutionPhase";
  id: number;
  workflowExecutionId: number;
  userId: string;
  status: string;
  number: number;
  node: string;
  name: string;
  startedAt: string;
  endedAt: string;
  temp: string;
}

export interface Environment {
  $type: "api.execution.Environment";
  phases: { [key: string]: string };
  code: string;
  startingCode: string;
  workflowExecutionId: number;
  componentId: number;
}

export interface Environment_PhasesEntry {
  $type: "api.execution.Environment.PhasesEntry";
  key: string;
  value: string;
}

export const API_EXECUTION_PACKAGE_NAME = "api.execution";

function createBaseUser(): User {
  return { $type: "api.execution.User", id: "", email: "" };
}

export const User: MessageFns<User, "api.execution.User"> = {
  $type: "api.execution.User" as const,

  encode(
    message: User,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.email !== "") {
      writer.uint32(18).string(message.email);
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
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.email = reader.string();
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

function createBaseGetPendingChangesRequest(): GetPendingChangesRequest {
  return { $type: "api.execution.GetPendingChangesRequest", executionId: 0 };
}

export const GetPendingChangesRequest: MessageFns<
  GetPendingChangesRequest,
  "api.execution.GetPendingChangesRequest"
> = {
  $type: "api.execution.GetPendingChangesRequest" as const,

  encode(
    message: GetPendingChangesRequest,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).join();
    }
    if (message.executionId !== 0) {
      writer.uint32(16).int32(message.executionId);
    }
    return writer;
  },

  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): GetPendingChangesRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetPendingChangesRequest();
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

          message.executionId = reader.int32();
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
  GetPendingChangesRequest.$type,
  GetPendingChangesRequest,
);

function createBasePendingChangesResponse(): PendingChangesResponse {
  return {
    $type: "api.execution.PendingChangesResponse",
    pendingApproval: {},
    status: "",
  };
}

export const PendingChangesResponse: MessageFns<
  PendingChangesResponse,
  "api.execution.PendingChangesResponse"
> = {
  $type: "api.execution.PendingChangesResponse" as const,

  encode(
    message: PendingChangesResponse,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    Object.entries(message.pendingApproval).forEach(([key, value]) => {
      PendingChangesResponse_PendingApprovalEntry.encode(
        {
          $type: "api.execution.PendingChangesResponse.PendingApprovalEntry",
          key: key as any,
          value,
        },
        writer.uint32(10).fork(),
      ).join();
    });
    if (message.status !== "") {
      writer.uint32(18).string(message.status);
    }
    return writer;
  },

  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): PendingChangesResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePendingChangesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          const entry1 = PendingChangesResponse_PendingApprovalEntry.decode(
            reader,
            reader.uint32(),
          );
          if (entry1.value !== undefined) {
            message.pendingApproval[entry1.key] = entry1.value;
          }
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.status = reader.string();
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

messageTypeRegistry.set(PendingChangesResponse.$type, PendingChangesResponse);

function createBasePendingChangesResponse_PendingApprovalEntry(): PendingChangesResponse_PendingApprovalEntry {
  return {
    $type: "api.execution.PendingChangesResponse.PendingApprovalEntry",
    key: "",
    value: "",
  };
}

export const PendingChangesResponse_PendingApprovalEntry: MessageFns<
  PendingChangesResponse_PendingApprovalEntry,
  "api.execution.PendingChangesResponse.PendingApprovalEntry"
> = {
  $type: "api.execution.PendingChangesResponse.PendingApprovalEntry" as const,

  encode(
    message: PendingChangesResponse_PendingApprovalEntry,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): PendingChangesResponse_PendingApprovalEntry {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePendingChangesResponse_PendingApprovalEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.value = reader.string();
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
  PendingChangesResponse_PendingApprovalEntry.$type,
  PendingChangesResponse_PendingApprovalEntry,
);

function createBaseApproveChangesRequest(): ApproveChangesRequest {
  return { $type: "api.execution.ApproveChangesRequest", executionId: 0 };
}

export const ApproveChangesRequest: MessageFns<
  ApproveChangesRequest,
  "api.execution.ApproveChangesRequest"
> = {
  $type: "api.execution.ApproveChangesRequest" as const,

  encode(
    message: ApproveChangesRequest,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).join();
    }
    if (message.executionId !== 0) {
      writer.uint32(16).int32(message.executionId);
    }
    if (message.body !== undefined) {
      ApproveChangesBody.encode(message.body, writer.uint32(26).fork()).join();
    }
    return writer;
  },

  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): ApproveChangesRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseApproveChangesRequest();
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

          message.executionId = reader.int32();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.body = ApproveChangesBody.decode(reader, reader.uint32());
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

messageTypeRegistry.set(ApproveChangesRequest.$type, ApproveChangesRequest);

function createBaseApproveChangesBody(): ApproveChangesBody {
  return {
    $type: "api.execution.ApproveChangesBody",
    decision: "",
    comment: "",
  };
}

export const ApproveChangesBody: MessageFns<
  ApproveChangesBody,
  "api.execution.ApproveChangesBody"
> = {
  $type: "api.execution.ApproveChangesBody" as const,

  encode(
    message: ApproveChangesBody,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.decision !== "") {
      writer.uint32(10).string(message.decision);
    }
    if (message.comment !== "") {
      writer.uint32(18).string(message.comment);
    }
    return writer;
  },

  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): ApproveChangesBody {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseApproveChangesBody();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.decision = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.comment = reader.string();
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

messageTypeRegistry.set(ApproveChangesBody.$type, ApproveChangesBody);

function createBaseApproveChangesResponse(): ApproveChangesResponse {
  return {
    $type: "api.execution.ApproveChangesResponse",
    message: "",
    status: "",
  };
}

export const ApproveChangesResponse: MessageFns<
  ApproveChangesResponse,
  "api.execution.ApproveChangesResponse"
> = {
  $type: "api.execution.ApproveChangesResponse" as const,

  encode(
    message: ApproveChangesResponse,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    if (message.status !== "") {
      writer.uint32(18).string(message.status);
    }
    return writer;
  },

  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): ApproveChangesResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseApproveChangesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.message = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.status = reader.string();
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

messageTypeRegistry.set(ApproveChangesResponse.$type, ApproveChangesResponse);

function createBaseExecuteWorkflowRequest(): ExecuteWorkflowRequest {
  return {
    $type: "api.execution.ExecuteWorkflowRequest",
    workflowExecutionId: 0,
    componentId: 0,
  };
}

export const ExecuteWorkflowRequest: MessageFns<
  ExecuteWorkflowRequest,
  "api.execution.ExecuteWorkflowRequest"
> = {
  $type: "api.execution.ExecuteWorkflowRequest" as const,

  encode(
    message: ExecuteWorkflowRequest,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.workflowExecutionId !== 0) {
      writer.uint32(8).int32(message.workflowExecutionId);
    }
    if (message.componentId !== 0) {
      writer.uint32(16).int32(message.componentId);
    }
    if (message.nextRunAt !== undefined) {
      writer.uint32(26).string(message.nextRunAt);
    }
    return writer;
  },

  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): ExecuteWorkflowRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExecuteWorkflowRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.workflowExecutionId = reader.int32();
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }

          message.componentId = reader.int32();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.nextRunAt = reader.string();
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

messageTypeRegistry.set(ExecuteWorkflowRequest.$type, ExecuteWorkflowRequest);

function createBaseEmpty(): Empty {
  return { $type: "api.execution.Empty" };
}

export const Empty: MessageFns<Empty, "api.execution.Empty"> = {
  $type: "api.execution.Empty" as const,

  encode(_: Empty, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Empty {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEmpty();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
};

messageTypeRegistry.set(Empty.$type, Empty);

function createBaseWorkflowExecution(): WorkflowExecution {
  return {
    $type: "api.execution.WorkflowExecution",
    id: 0,
    workflowId: 0,
    userId: "",
    status: "",
    startedAt: "",
    endedAt: "",
    trigger: "",
    definition: "",
    executionPhases: [],
  };
}

export const WorkflowExecution: MessageFns<
  WorkflowExecution,
  "api.execution.WorkflowExecution"
> = {
  $type: "api.execution.WorkflowExecution" as const,

  encode(
    message: WorkflowExecution,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.workflowId !== 0) {
      writer.uint32(16).int32(message.workflowId);
    }
    if (message.userId !== "") {
      writer.uint32(26).string(message.userId);
    }
    if (message.status !== "") {
      writer.uint32(34).string(message.status);
    }
    if (message.startedAt !== "") {
      writer.uint32(42).string(message.startedAt);
    }
    if (message.endedAt !== "") {
      writer.uint32(50).string(message.endedAt);
    }
    if (message.trigger !== "") {
      writer.uint32(58).string(message.trigger);
    }
    if (message.definition !== "") {
      writer.uint32(66).string(message.definition);
    }
    if (message.workflow !== undefined) {
      Workflow.encode(message.workflow, writer.uint32(74).fork()).join();
    }
    for (const v of message.executionPhases) {
      ExecutionPhase.encode(v!, writer.uint32(82).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): WorkflowExecution {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWorkflowExecution();
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
          if (tag !== 16) {
            break;
          }

          message.workflowId = reader.int32();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.userId = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.status = reader.string();
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.startedAt = reader.string();
          continue;
        }
        case 6: {
          if (tag !== 50) {
            break;
          }

          message.endedAt = reader.string();
          continue;
        }
        case 7: {
          if (tag !== 58) {
            break;
          }

          message.trigger = reader.string();
          continue;
        }
        case 8: {
          if (tag !== 66) {
            break;
          }

          message.definition = reader.string();
          continue;
        }
        case 9: {
          if (tag !== 74) {
            break;
          }

          message.workflow = Workflow.decode(reader, reader.uint32());
          continue;
        }
        case 10: {
          if (tag !== 82) {
            break;
          }

          message.executionPhases.push(
            ExecutionPhase.decode(reader, reader.uint32()),
          );
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

messageTypeRegistry.set(WorkflowExecution.$type, WorkflowExecution);

function createBaseWorkflow(): Workflow {
  return {
    $type: "api.execution.Workflow",
    id: 0,
    name: "",
    description: "",
    userId: "",
    definition: "",
    status: "",
    executionPlan: "",
    creditsCost: 0,
  };
}

export const Workflow: MessageFns<Workflow, "api.execution.Workflow"> = {
  $type: "api.execution.Workflow" as const,

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
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    if (message.userId !== "") {
      writer.uint32(34).string(message.userId);
    }
    if (message.definition !== "") {
      writer.uint32(42).string(message.definition);
    }
    if (message.status !== "") {
      writer.uint32(50).string(message.status);
    }
    if (message.executionPlan !== "") {
      writer.uint32(58).string(message.executionPlan);
    }
    if (message.creditsCost !== 0) {
      writer.uint32(64).int32(message.creditsCost);
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

          message.userId = reader.string();
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.definition = reader.string();
          continue;
        }
        case 6: {
          if (tag !== 50) {
            break;
          }

          message.status = reader.string();
          continue;
        }
        case 7: {
          if (tag !== 58) {
            break;
          }

          message.executionPlan = reader.string();
          continue;
        }
        case 8: {
          if (tag !== 64) {
            break;
          }

          message.creditsCost = reader.int32();
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

function createBaseExecutionPhase(): ExecutionPhase {
  return {
    $type: "api.execution.ExecutionPhase",
    id: 0,
    workflowExecutionId: 0,
    userId: "",
    status: "",
    number: 0,
    node: "",
    name: "",
    startedAt: "",
    endedAt: "",
    temp: "",
  };
}

export const ExecutionPhase: MessageFns<
  ExecutionPhase,
  "api.execution.ExecutionPhase"
> = {
  $type: "api.execution.ExecutionPhase" as const,

  encode(
    message: ExecutionPhase,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.workflowExecutionId !== 0) {
      writer.uint32(16).int32(message.workflowExecutionId);
    }
    if (message.userId !== "") {
      writer.uint32(26).string(message.userId);
    }
    if (message.status !== "") {
      writer.uint32(34).string(message.status);
    }
    if (message.number !== 0) {
      writer.uint32(40).int32(message.number);
    }
    if (message.node !== "") {
      writer.uint32(50).string(message.node);
    }
    if (message.name !== "") {
      writer.uint32(58).string(message.name);
    }
    if (message.startedAt !== "") {
      writer.uint32(66).string(message.startedAt);
    }
    if (message.endedAt !== "") {
      writer.uint32(74).string(message.endedAt);
    }
    if (message.temp !== "") {
      writer.uint32(82).string(message.temp);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): ExecutionPhase {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExecutionPhase();
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
          if (tag !== 16) {
            break;
          }

          message.workflowExecutionId = reader.int32();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.userId = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.status = reader.string();
          continue;
        }
        case 5: {
          if (tag !== 40) {
            break;
          }

          message.number = reader.int32();
          continue;
        }
        case 6: {
          if (tag !== 50) {
            break;
          }

          message.node = reader.string();
          continue;
        }
        case 7: {
          if (tag !== 58) {
            break;
          }

          message.name = reader.string();
          continue;
        }
        case 8: {
          if (tag !== 66) {
            break;
          }

          message.startedAt = reader.string();
          continue;
        }
        case 9: {
          if (tag !== 74) {
            break;
          }

          message.endedAt = reader.string();
          continue;
        }
        case 10: {
          if (tag !== 82) {
            break;
          }

          message.temp = reader.string();
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

messageTypeRegistry.set(ExecutionPhase.$type, ExecutionPhase);

function createBaseEnvironment(): Environment {
  return {
    $type: "api.execution.Environment",
    phases: {},
    code: "",
    startingCode: "",
    workflowExecutionId: 0,
    componentId: 0,
  };
}

export const Environment: MessageFns<Environment, "api.execution.Environment"> =
  {
    $type: "api.execution.Environment" as const,

    encode(
      message: Environment,
      writer: BinaryWriter = new BinaryWriter(),
    ): BinaryWriter {
      Object.entries(message.phases).forEach(([key, value]) => {
        Environment_PhasesEntry.encode(
          {
            $type: "api.execution.Environment.PhasesEntry",
            key: key as any,
            value,
          },
          writer.uint32(10).fork(),
        ).join();
      });
      if (message.code !== "") {
        writer.uint32(18).string(message.code);
      }
      if (message.startingCode !== "") {
        writer.uint32(26).string(message.startingCode);
      }
      if (message.workflowExecutionId !== 0) {
        writer.uint32(32).int32(message.workflowExecutionId);
      }
      if (message.componentId !== 0) {
        writer.uint32(40).int32(message.componentId);
      }
      return writer;
    },

    decode(input: BinaryReader | Uint8Array, length?: number): Environment {
      const reader =
        input instanceof BinaryReader ? input : new BinaryReader(input);
      let end = length === undefined ? reader.len : reader.pos + length;
      const message = createBaseEnvironment();
      while (reader.pos < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1: {
            if (tag !== 10) {
              break;
            }

            const entry1 = Environment_PhasesEntry.decode(
              reader,
              reader.uint32(),
            );
            if (entry1.value !== undefined) {
              message.phases[entry1.key] = entry1.value;
            }
            continue;
          }
          case 2: {
            if (tag !== 18) {
              break;
            }

            message.code = reader.string();
            continue;
          }
          case 3: {
            if (tag !== 26) {
              break;
            }

            message.startingCode = reader.string();
            continue;
          }
          case 4: {
            if (tag !== 32) {
              break;
            }

            message.workflowExecutionId = reader.int32();
            continue;
          }
          case 5: {
            if (tag !== 40) {
              break;
            }

            message.componentId = reader.int32();
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

messageTypeRegistry.set(Environment.$type, Environment);

function createBaseEnvironment_PhasesEntry(): Environment_PhasesEntry {
  return { $type: "api.execution.Environment.PhasesEntry", key: "", value: "" };
}

export const Environment_PhasesEntry: MessageFns<
  Environment_PhasesEntry,
  "api.execution.Environment.PhasesEntry"
> = {
  $type: "api.execution.Environment.PhasesEntry" as const,

  encode(
    message: Environment_PhasesEntry,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): Environment_PhasesEntry {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEnvironment_PhasesEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.value = reader.string();
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

messageTypeRegistry.set(Environment_PhasesEntry.$type, Environment_PhasesEntry);

export interface ExecutionsServiceClient {
  getPendingChanges(
    request: GetPendingChangesRequest,
  ): Observable<PendingChangesResponse>;

  approveChanges(
    request: ApproveChangesRequest,
  ): Observable<ApproveChangesResponse>;

  execute(request: ExecuteWorkflowRequest): Observable<Empty>;
}

export interface ExecutionsServiceController {
  getPendingChanges(
    request: GetPendingChangesRequest,
  ):
    | Promise<PendingChangesResponse>
    | Observable<PendingChangesResponse>
    | PendingChangesResponse;

  approveChanges(
    request: ApproveChangesRequest,
  ):
    | Promise<ApproveChangesResponse>
    | Observable<ApproveChangesResponse>
    | ApproveChangesResponse;

  execute(
    request: ExecuteWorkflowRequest,
  ): Promise<Empty> | Observable<Empty> | Empty;
}

export function ExecutionsServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "getPendingChanges",
      "approveChanges",
      "execute",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod("ExecutionsService", method)(
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
      GrpcStreamMethod("ExecutionsService", method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const EXECUTIONS_SERVICE_NAME = "ExecutionsService";

export interface MessageFns<T, V extends string> {
  readonly $type: V;
  encode(message: T, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): T;
}
