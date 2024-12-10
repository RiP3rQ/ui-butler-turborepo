import { LucideProps, TestTubeDiagonalIcon } from "lucide-react";
import { ServerCreateUnitTestsTask } from "./server/server-create-unit-tests";

export const CreateUnitTestsTask = {
  ...ServerCreateUnitTestsTask,
  icon: (props: LucideProps) => (
    <TestTubeDiagonalIcon className="stroke-orange-400 size-4" {...props} />
  ),
} as const;
