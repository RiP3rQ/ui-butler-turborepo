import type { LucideProps } from "lucide-react";
import { GlobeIcon } from "lucide-react";
import { WorkflowTask } from "@repo/types";
import { ServerSetCodeContextTask } from "./server/server-set-code-context";

export const SetCodeContextTask: WorkflowTask = {
  ...ServerSetCodeContextTask,
  icon: (props: LucideProps) => (
    <GlobeIcon className="stroke-pink-400 size-4" {...props} />
  ),
} as const;
