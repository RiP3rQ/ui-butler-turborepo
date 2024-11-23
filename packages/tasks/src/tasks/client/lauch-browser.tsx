import { WorkflowTask } from "@repo/types";
import { GlobeIcon, LucideIcon } from "lucide-react";
import { ServerLaunchBrowserTask } from "../server/lauch-browser";

export const LaunchBrowserTask: WorkflowTask = {
  ...ServerLaunchBrowserTask,
  icon: (props: LucideIcon) => (
    <GlobeIcon className="stroke-pink-400" {...props} />
  ),
} as const;
