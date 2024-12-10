import { BaseWorkflowTask, ExecutionEnvironment, TaskType } from '@repo/types';
import { setCodeContextExecutor } from './set-code-context-executor';

type ExecutorFunctionType<T extends BaseWorkflowTask> = (
  environment: ExecutionEnvironment<T>,
) => Promise<boolean>;

type RegistryType = {
  [K in TaskType]: ExecutorFunctionType<BaseWorkflowTask & { type: K }>;
};

export const ExecutorRegistry: RegistryType = {
  SET_CODE_CONTEXT: setCodeContextExecutor,
};
