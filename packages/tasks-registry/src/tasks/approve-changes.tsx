import { ListCheckIcon, LucideProps } from "lucide-react";
import { ServerApproveChangesTask } from "./server/server-approve-changes";

export const ApproveChangesTask = {
  ...ServerApproveChangesTask,
  icon: (props: LucideProps) => (
    <ListCheckIcon className="stroke-purple-500 size-4" {...props} />
  ),
} as const;
