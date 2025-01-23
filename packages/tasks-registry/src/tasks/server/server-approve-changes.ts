import { type BaseWorkflowTask, TaskParamType, TaskType } from "@shared/types";

export const ServerApproveChangesTask = {
  type: TaskType.APPROVE_CHANGES,
  label: "Approve/reject the changes",
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
  temp: [
    {
      name: "Original code",
      type: TaskParamType.CODE_INSTANCE,
    },
    {
      name: "Pending code",
      type: TaskParamType.CODE_INSTANCE,
    },
    {
      name: "Component ID",
      type: TaskParamType.STRING,
    },
  ] as const,
  credits: 1,
} satisfies BaseWorkflowTask;

export type ServerApproveChangesTaskType = typeof ServerApproveChangesTask;
