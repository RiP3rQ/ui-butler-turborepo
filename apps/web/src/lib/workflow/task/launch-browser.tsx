import { TaskParamType, TaskType } from "@repo/types/src/task";
import type { LucideProps } from "lucide-react";
import { GlobeIcon } from "lucide-react";
import type { WorkflowTask } from "@repo/types/src/workflow";

export const LaunchBrowserTask = {
  type: TaskType.LAUNCH_BROWSER,
  label: "Launch Browser",
  icon: (props: LucideProps) => (
    <GlobeIcon className="stroke-pink-400" {...props} />
  ),
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
} satisfies WorkflowTask;
