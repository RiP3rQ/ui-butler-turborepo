import { BaseWorkflowTask, TaskParamType, TaskType } from "@repo/types";

export const ServerSaveGeneratedCodesTask = {
  type: TaskType.SAVE_GENERATED_CODES,
  label: "Save Generated Codes",
  isEntryPoint: false,
  inputs: [
    {
      name: "Code",
      type: TaskParamType.CODE_INSTANCE,
      required: false,
    },
    {
      name: "Tests",
      type: TaskParamType.STRING,
      required: false,
    },
  ] as const,
  outputs: [] as const,
  credits: 0,
} satisfies BaseWorkflowTask;

export type ServerSaveGeneratedCodesTaskType =
  typeof ServerSaveGeneratedCodesTask;
