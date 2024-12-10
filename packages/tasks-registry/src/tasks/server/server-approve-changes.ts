import { BaseWorkflowTask, TaskParamType, TaskType } from "@repo/types";

export const ServerApproveChangesTask = {
  type: TaskType.APPROVE_CHANGES,
  label: "Stop the workflow and approve/reject the changes",
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
  credits: 0,
} satisfies BaseWorkflowTask;

export type ServerApproveChangesTaskType = typeof ServerApproveChangesTask;
