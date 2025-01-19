import { FlaskConicalIcon, type LucideProps } from "lucide-react";
import { ServerCreateE2ETestsTask } from "./server/server-create-e2e-tests";

export const CreateE2ETestsTask = {
  ...ServerCreateE2ETestsTask,
  icon: (props: LucideProps) => (
    <FlaskConicalIcon className="stroke-orange-400 size-4" {...props} />
  ),
} as const;
