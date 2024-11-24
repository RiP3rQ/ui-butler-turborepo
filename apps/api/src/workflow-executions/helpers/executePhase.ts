import {
  AppNode,
  Environment,
  ExecutionEnvironment,
  ExecutionPhase,
  LogCollector,
} from '@repo/types';
import { createExecutionEnvironment } from './createExecutionEnvironment';
import { ExecutorRegistry } from '@repo/tasks';

export async function executePhase(
  phase: ExecutionPhase,
  node: AppNode,
  environment: Environment,
  logCollector: LogCollector,
): Promise<boolean> {
  if (!phase || !node) {
    throw new Error('Execution phase-phase-executors or node not found');
  }

  const runFn = ExecutorRegistry[node.data.type];
  if (!runFn) {
    logCollector.ERROR(`Executor not found for ${node.data.type}`);
    throw new Error(`Executor not found for ${node.data.type}`);
  }

  // Get values ONLY FOR THIS PHASE from the environment
  const executionEnvironment: ExecutionEnvironment<any> =
    createExecutionEnvironment(node, environment, logCollector);

  return await runFn(executionEnvironment);
}
