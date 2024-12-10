import type { LucideProps } from "lucide-react";
import { GlobeIcon } from "lucide-react";
import { ServerSetCodeContextTask } from "./server/server-set-code-context";

export const SetCodeContextTask = {
  ...ServerSetCodeContextTask,
  icon: (props: LucideProps) => (
    <GlobeIcon className="stroke-pink-400 size-4" {...props} />
  ),
} as const;
