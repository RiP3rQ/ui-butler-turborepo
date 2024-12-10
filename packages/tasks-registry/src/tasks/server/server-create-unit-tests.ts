import { BaseWorkflowTask, TaskParamType, TaskType } from "@repo/types";

export const ServerCreateUnitTestsTask = {
  type: TaskType.CREATE_UNIT_TESTS,
  label: "Create Unit Tests",
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
      name: "Unit Tests",
      type: TaskParamType.STRING,
    },
  ] as const,
  credits: 3,
} satisfies BaseWorkflowTask;

export type ServerCreateUnitTestsTask = typeof ServerCreateUnitTestsTask;
