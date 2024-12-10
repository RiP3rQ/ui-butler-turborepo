import { BaseWorkflowTask, ExecutionEnvironment, TaskType } from '@repo/types';
import { setCodeContextExecutor } from './set-code-context-executor';
import { optimizeCodeExecutor } from './optimize-code-executor';
import { improveStylesExecutor } from './improve-styles-executor';
import { createUnitTestsExecutor } from './create-unit-tests-executor';
import { createE2ETestsExecutor } from './create-e2e-tests-executor';
import { createTsDocsExecutor } from './create-ts-docs-executor';
import { createMdxDocsExecutor } from './create-mdx-docs-executor';

type ExecutorFunctionType<T extends BaseWorkflowTask> = (
  environment: ExecutionEnvironment<T>,
) => Promise<boolean>;

type RegistryType = {
  [K in TaskType]: ExecutorFunctionType<BaseWorkflowTask & { type: K }>;
};

export const ExecutorRegistry: RegistryType = {
  [TaskType.SET_CODE_CONTEXT]: setCodeContextExecutor,
  // GENERAL TASKS
  [TaskType.OPTIMIZE_CODE]: optimizeCodeExecutor,
  [TaskType.IMPROVE_STYLES]: improveStylesExecutor,
  // TESTS
  [TaskType.CREATE_UNIT_TESTS]: createUnitTestsExecutor,
  [TaskType.CREATE_E2E_TESTS]: createE2ETestsExecutor,
  // DOCS
  [TaskType.CREATE_TYPESCRIPT_DOCUMENTATION]: createTsDocsExecutor,
  [TaskType.CREATE_MDX_DOCUMENTATION]: createMdxDocsExecutor,
};
