import { BaseWorkflowTask, TaskParamType, TaskType } from "@repo/types";

export const ServerCreateUnitTestsTask = {
  type: TaskType.CREATE_UNIT_TESTS,
  label: "Create Unit Tests",
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
      name: "Unit Tests",
      type: TaskParamType.UNIT_TESTS,
    },
  ] as const,
  credits: 3,
  creditsWithoutApiKey: 10,
} satisfies BaseWorkflowTask;

export type ServerCreateUnitTestsTaskType = typeof ServerCreateUnitTestsTask;
