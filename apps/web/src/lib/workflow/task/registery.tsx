import type { TaskType } from "@repo/types/src/task";
import type { WorkflowTask } from "@repo/types/src/workflow";
import { LaunchBrowserTask } from "@repo/ui/lib/workflow/task/launch-browser";

type Registry = {
  [Key in TaskType]: WorkflowTask & { type: Key };
};

export const TaskRegistry: Registry = {
  LAUNCH_BROWSER: LaunchBrowserTask,
};
