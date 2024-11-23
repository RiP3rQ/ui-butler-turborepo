import type { LucideIcon } from "lucide-react";
import { GlobeIcon } from "lucide-react";
import { ServerLaunchBrowserTask } from "@repo/tasks";
import type { WorkflowTask } from "@repo/types";

export const LaunchBrowserTask: WorkflowTask = {
  ...ServerLaunchBrowserTask,
  icon: (props: LucideIcon) => (
    <GlobeIcon className="stroke-pink-400 size-4" {...props} />
  ),
} as const;
