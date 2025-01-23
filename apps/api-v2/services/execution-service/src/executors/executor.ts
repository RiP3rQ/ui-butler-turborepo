import { type DrizzleDatabase } from '@microservices/database';
import {
  type BaseWorkflowTask,
  type ExecutionEnvironment,
  TaskType,
  type WorkflowExecutionStatus,
} from '@shared/types';
import { approveChangesExecutor } from './approve-changes-executor';
import { createE2ETestsExecutor } from './create-e2e-tests-executor';
import { createMdxDocsExecutor } from './create-mdx-docs-executor';
import { createTsDocsExecutor } from './create-ts-docs-executor';
import { createUnitTestsExecutor } from './create-unit-tests-executor';
import { improveStylesExecutor } from './improve-styles-executor';
import { optimizeCodeExecutor } from './optimize-code-executor';
import { saveGeneratedCodesExecutor } from './save-generated-codes-executor';
import { setCodeContextExecutor } from './set-code-context-executor';

type ExecutorFunctionType<T extends BaseWorkflowTask> = (
  environment: ExecutionEnvironment<T>,
  database: DrizzleDatabase,
  workflowExecutionId: number,
) => Promise<boolean | typeof WorkflowExecutionStatus.WAITING_FOR_APPROVAL>;

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
  // STOPPERS
  [TaskType.SAVE_GENERATED_CODES]: saveGeneratedCodesExecutor,
  [TaskType.APPROVE_CHANGES]: approveChangesExecutor,
};
