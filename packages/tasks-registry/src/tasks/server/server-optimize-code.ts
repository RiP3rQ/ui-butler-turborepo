import { BaseWorkflowTask, TaskParamType, TaskType } from "@repo/types";

export const ServerOptimizeCodeTask = {
  type: TaskType.OPTIMIZE_CODE,
  label: "Optimize Code",
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
      name: "Code",
      type: TaskParamType.STRING,
    },
  ] as const,
  credits: 2,
} satisfies BaseWorkflowTask;

export type ServerOptimizeCodeTaskType = typeof ServerOptimizeCodeTask;
