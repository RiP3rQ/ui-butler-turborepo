import { CircleFadingArrowUpIcon, LucideProps } from "lucide-react";
import { ServerOptimizeCodeTask } from "./server/server-optimize-code";

export const OptimizeCodeTask = {
  ...ServerOptimizeCodeTask,
  icon: (props: LucideProps) => (
    <CircleFadingArrowUpIcon className="stroke-purple-500 size-4" {...props} />
  ),
} as const;
