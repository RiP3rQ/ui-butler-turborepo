import { type BaseWorkflowTask, TaskParamType, TaskType } from "@shared/types";

export const ServerCreateMDXDocsTask = {
  type: TaskType.CREATE_MDX_DOCUMENTATION,
  label: "Create MDX Docs",
  isEntryPoint: false,
  inputs: [
    {
      name: "API key",
      type: TaskParamType.CREDENTIAL,
      required: true,
    },
    {
      name: "Code",
      type: TaskParamType.CODE_INSTANCE,
      required: true,
    },
  ] as const,
  outputs: [
    {
      name: "MDX Docs",
      type: TaskParamType.MDX,
    },
  ] as const,
  credits: 3,
  creditsWithoutApiKey: 10,
} satisfies BaseWorkflowTask;

export type ServerCreateMDXDocsTaskType = typeof ServerCreateMDXDocsTask;
