import type { TaskType, WorkflowTask } from "@repo/types";
import { LaunchBrowserTask } from "../tasks/client/lauch-browser";

type ClientRegistry = {
  [Key in TaskType]: WorkflowTask & { type: Key };
};

export const ClientTaskRegistery: ClientRegistry = {
  LAUNCH_BROWSER: LaunchBrowserTask,
};
