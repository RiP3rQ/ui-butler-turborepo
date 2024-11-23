import { BaseWorkflowTask, TaskParamType, TaskType } from "@repo/types";

export const ServerLaunchBrowserTask: BaseWorkflowTask = {
  type: TaskType.LAUNCH_BROWSER,
  label: "Launch Browser",
  isEntryPoint: true,
  inputs: [
    {
      name: "Website URL",
      type: TaskParamType.STRING,
      helperText: "eq. https://google.com",
      required: true,
      hideHandle: true,
    },
  ] as const,
  outputs: [
    {
      name: "Browser",
      type: TaskParamType.BROWSER_INSTANCE,
    },
  ] as const,
  credits: 5,
} as const;
