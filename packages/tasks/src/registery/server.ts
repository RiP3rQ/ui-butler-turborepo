import type { BaseWorkflowTask } from "@repo/types";
import { TaskType } from "@repo/types";
import { ServerLaunchBrowserTask } from "../tasks/server/lauch-browser";

type ServerRegistry = {
  [Key in TaskType]: BaseWorkflowTask;
};

export const ServerTaskRegistery: ServerRegistry = {
  LAUNCH_BROWSER: ServerLaunchBrowserTask,
};
