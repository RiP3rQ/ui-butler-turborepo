import { ExecutionEnvironment, TaskType, WorkflowTask } from "@repo/types";
import { launchBrowserExecutor } from "./phase-executors/launch-browser-executor";

type ExecutorFunctionType<T extends WorkflowTask> = (
  environment: ExecutionEnvironment<T>,
) => Promise<boolean>;

type RegistryType = {
  [K in TaskType]: ExecutorFunctionType<WorkflowTask & { type: K }>;
};

export const ExecutorRegistry: RegistryType = {
  LAUNCH_BROWSER: launchBrowserExecutor,
};
