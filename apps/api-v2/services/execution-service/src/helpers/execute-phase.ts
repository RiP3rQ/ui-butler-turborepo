import { type DrizzleDatabase } from '@microservices/database';
import {
  type AppNode,
  type BaseWorkflowTask,
  type Environment,
  type ExecutionEnvironment,
  type ExecutionPhaseWithDatesInsteadOfProtoTimestamp,
  type LogCollector,
  type WorkflowExecutionStatus,
} from '@shared/types';
import { ExecutorRegistry } from '../executors/executor';
import { createExecutionEnvironment } from './create-execution-environment';

export async function executePhase<T extends keyof BaseWorkflowTask>(
  database: DrizzleDatabase,
  phase: ExecutionPhaseWithDatesInsteadOfProtoTimestamp | undefined,
  node: AppNode | undefined,
  environment: Environment,
  logCollector: LogCollector,
): Promise<boolean | typeof WorkflowExecutionStatus.WAITING_FOR_APPROVAL> {
  if (!phase || !node) {
    throw new Error('Execution phase-executors or node not found');
  }

  const runFn = ExecutorRegistry[node.data.type];
  if (!runFn) {
    logCollector.ERROR(`Executor not found for ${node.data.type}`);
    throw new Error(`Executor not found for ${node.data.type}`);
  }

  // Get values ONLY FOR THIS PHASE from the environment
  // TODO: FIX THIS TYPE
  const executionEnvironment: ExecutionEnvironment<T> =
    createExecutionEnvironment(node, environment, logCollector);

  return await runFn(
    executionEnvironment,
    database,
    environment.workflowExecutionId,
  );
}
