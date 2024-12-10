import {
  AppNode,
  Environment,
  ExecutionPhase,
  ServerSaveEdge,
  WorkflowExecutionStatus,
} from '@repo/types';
import { ServerTaskRegister } from '@repo/tasks-registry';
import { createLogCollector } from './create-workflow-log-collector';
import { decrementUserCredits } from './decrementUserCredits';
import { setupPhaseEnvironment } from './setupPhaseEnvironment';
import { executePhase } from './executePhase';
import { finalizeExecutionPhase } from './finalizeExecutionPhase';
import { DrizzleDatabase } from '../../database/merged-schemas';
import { workflowExecutions } from '../../database/schemas/workflow-executions';
import { eq } from 'drizzle-orm';

export async function executeWorkflowPhase(
  database: DrizzleDatabase,
  phase: ExecutionPhase,
  environment: Environment,
  edges: ServerSaveEdge[],
  userId: number,
) {
  if (!phase) {
    throw new Error('Execution phase-executors not found');
  }

  const logCollector = createLogCollector();

  const startedAt = new Date();
  const node = JSON.parse(phase.node) as AppNode;
  setupPhaseEnvironment(node, environment, edges);

  // Update phase-executors status
  const updatedPhaseData = {
    status: WorkflowExecutionStatus.RUNNING,
    startedAt,
    inputs: JSON.stringify(environment.phases[node.id].inputs),
    outputs: JSON.stringify(environment.phases[node.id].outputs),
  };

  const [updatedPhase] = await database
    .update(workflowExecutions)
    .set(updatedPhaseData)
    .where(eq(workflowExecutions.id, phase.id))
    .returning();

  if (!updatedPhase) {
    throw new Error('Failed to update phase-executors');
  }

  // Decrement user balance
  const creditsRequired = ServerTaskRegister[node.data.type].credits;
  let success = await decrementUserCredits(
    database,
    userId,
    creditsRequired,
    logCollector,
  );
  const creditsConsumed = success ? creditsRequired : 0;

  if (success) {
    // Actual execution
    success = await executePhase(phase, node, environment, logCollector);
  }

  // Finalize phase-executors
  const outputs = environment.phases[node.id].outputs;
  await finalizeExecutionPhase(
    database,
    phase.id,
    success,
    outputs,
    logCollector,
    creditsConsumed,
  );
  return { success, creditsConsumed };
}
