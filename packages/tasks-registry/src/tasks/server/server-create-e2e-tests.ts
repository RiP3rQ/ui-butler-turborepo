import { BaseWorkflowTask, TaskParamType, TaskType } from "@repo/types";

export const ServerCreateE2ETestsTask = {
  type: TaskType.CREATE_E2E_TESTS,
  label: "Create E2E Tests",
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
      name: "E2E Tests",
      type: TaskParamType.STRING,
    },
  ] as const,
  credits: 3,
} satisfies BaseWorkflowTask;

export type ServerCreateE2ETestsTask = typeof ServerCreateE2ETestsTask;
