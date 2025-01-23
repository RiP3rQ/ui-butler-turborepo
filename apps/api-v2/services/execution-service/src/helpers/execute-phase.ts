import {
  type AppNode,
  type Environment,
  type ExecutionEnvironment,
  type ExecutionPhase,
  type LogCollector,
  type WorkflowExecutionStatus,
} from '@shared/types';
import { type DrizzleDatabase } from '@app/database';
import { ExecutorRegistry } from '../executors/executor';
import { createExecutionEnvironment } from './create-execution-environment';

export async function executePhase(
  database: DrizzleDatabase,
  phase: ExecutionPhase | undefined,
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
  const executionEnvironment: ExecutionEnvironment<any> =
    createExecutionEnvironment(node, environment, logCollector);

  return await runFn(
    executionEnvironment,
    database,
    environment.workflowExecutionId,
  );
}
