import { type BaseWorkflowTask, TaskParamType, TaskType } from "@repo/types";

export const ServerSetCodeContextTask = {
  type: TaskType.SET_CODE_CONTEXT,
  label: "Set Code Context",
  isEntryPoint: true as boolean,
  inputs: [
    {
      name: "Code",
      type: TaskParamType.STRING,
      helperText: `eq. <div>hello world</div>`,
      required: true,
      hideHandle: true,
    },
  ] as const,
  outputs: [
    {
      name: "Code",
      type: TaskParamType.CODE_INSTANCE,
    },
  ] as const,
  credits: 0,
} satisfies BaseWorkflowTask;

export type ServerSetCodeContextTaskType = typeof ServerSetCodeContextTask;
