import type { TaskType, WorkflowTask } from "@repo/types";
import { LaunchBrowserTask } from "./tasks/lauch-browser";

type ClientRegistry = {
  [Key in TaskType]: WorkflowTask & { type: Key };
};

export const ClientTaskRegister: ClientRegistry = {
  LAUNCH_BROWSER: LaunchBrowserTask,
};
