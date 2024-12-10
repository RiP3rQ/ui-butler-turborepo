import { BaseWorkflowTask, TaskParamType, TaskType } from "@repo/types";

export const ServerImproveStylesTask = {
  type: TaskType.IMPROVE_STYLES,
  label: "Improve Styles",
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
      type: TaskParamType.CODE_INSTANCE,
    },
  ] as const,
  credits: 1,
} satisfies BaseWorkflowTask;

export type ServerImproveStylesTask = typeof ServerImproveStylesTask;
