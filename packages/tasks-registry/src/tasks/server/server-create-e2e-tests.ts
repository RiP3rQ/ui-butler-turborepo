import { BaseWorkflowTask, TaskParamType, TaskType } from "@repo/types";

export const ServerCreateE2ETestsTask = {
  type: TaskType.CREATE_E2E_TESTS,
  label: "Create E2E Tests",
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
      name: "E2E Tests",
      type: TaskParamType.E2E_TESTS,
    },
  ] as const,
  credits: 3,
} satisfies BaseWorkflowTask;

export type ServerCreateE2ETestsTaskType = typeof ServerCreateE2ETestsTask;
