import { type BaseWorkflowTask, TaskParamType, TaskType } from "@shared/types";

export const ServerImproveStylesTask = {
  type: TaskType.IMPROVE_STYLES,
  label: "Improve Styles",
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
  credits: 1,
  creditsWithoutApiKey: 6,
} satisfies BaseWorkflowTask;

export type ServerImproveStylesTaskType = typeof ServerImproveStylesTask;
