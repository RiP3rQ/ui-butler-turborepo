import { BaseWorkflowTask, TaskParamType, TaskType } from "@repo/types";

export const ServerCreateTypeScriptDocsTask = {
  type: TaskType.CREATE_TYPESCRIPT_DOCUMENTATION,
  label: "Create TypeScript Docs",
  isEntryPoint: false,
  inputs: [
    {
      name: "Code",
      type: TaskParamType.CODE_INSTANCE,
      required: true,
    },
  ] as const,
  outputs: [
    {
      name: "TypeScript Docs",
      type: TaskParamType.TS_DOCS,
    },
  ] as const,
  credits: 1,
} satisfies BaseWorkflowTask;

export type ServerCreateTypeScriptDocsTaskType =
  typeof ServerCreateTypeScriptDocsTask;
