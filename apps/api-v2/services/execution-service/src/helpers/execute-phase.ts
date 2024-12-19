import {
  AppNode,
  Environment,
  ExecutionEnvironment,
  ExecutionPhase,
  LogCollector,
  WorkflowExecutionStatus,
} from '@repo/types';
import { createExecutionEnvironment } from './create-execution-environment';
import { ExecutorRegistry } from '../executors/executor';
import { DrizzleDatabase } from '@app/database';

export async function executePhase(
  database: DrizzleDatabase,
  phase: ExecutionPhase,
  node: AppNode,
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
