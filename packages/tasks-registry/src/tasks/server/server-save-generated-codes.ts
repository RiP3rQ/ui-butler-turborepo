import { type BaseWorkflowTask, TaskParamType, TaskType } from "@repo/types";

export const ServerSaveGeneratedCodesTask = {
  type: TaskType.SAVE_GENERATED_CODES,
  label: "Save Generated Outputs",
  isEntryPoint: false,
  inputs: [
    {
      name: "Code",
      type: TaskParamType.CODE_INSTANCE,
      required: true,
    },
    {
      name: "Unit Tests",
      type: TaskParamType.UNIT_TESTS,
      required: false,
    },
    {
      name: "E2E Tests",
      type: TaskParamType.E2E_TESTS,
      required: false,
    },
    {
      name: "MDX Docs",
      type: TaskParamType.MDX,
      required: false,
    },
    {
      name: "Typescript Docs",
      type: TaskParamType.TS_DOCS,
      required: false,
    },
  ] as const,
  outputs: [] as const,
  credits: 0,
} satisfies BaseWorkflowTask;

export type ServerSaveGeneratedCodesTaskType =
  typeof ServerSaveGeneratedCodesTask;
