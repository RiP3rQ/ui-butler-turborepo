import { BaseWorkflowTask, TaskParamType, TaskType } from "@repo/types";

export const ServerOptimizeCodeTask = {
  type: TaskType.OPTIMIZE_CODE,
  label: "Optimize Code",
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
      name: "Code",
      type: TaskParamType.CODE_INSTANCE,
    },
  ] as const,
  credits: 2,
  creditsWithoutApiKey: 8,
} satisfies BaseWorkflowTask;

export type ServerOptimizeCodeTaskType = typeof ServerOptimizeCodeTask;
