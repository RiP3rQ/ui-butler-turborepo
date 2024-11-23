import type { BaseWorkflowTask, TaskType } from "@repo/types";
import { ServerLaunchBrowserTask } from "./tasks/lauch-browser";

type ServerRegistry = {
  [Key in TaskType]: BaseWorkflowTask;
};

export const ServerTaskRegister: ServerRegistry = {
  LAUNCH_BROWSER: ServerLaunchBrowserTask,
};
