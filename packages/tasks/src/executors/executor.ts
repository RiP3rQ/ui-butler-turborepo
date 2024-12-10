import { ExecutionEnvironment, TaskType, WorkflowTask } from "@repo/types";
import { setCodeContextExecutor } from "./set-code-context-executor";

type ExecutorFunctionType<T extends WorkflowTask> = (
  environment: ExecutionEnvironment<T>,
) => Promise<boolean>;

type RegistryType = {
  [K in TaskType]: ExecutorFunctionType<WorkflowTask & { type: K }>;
};

export const ExecutorRegistry: RegistryType = {
  SET_CODE_CONTEXT: setCodeContextExecutor,
};
