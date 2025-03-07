import {
  type DrizzleDatabase,
  eq,
  executionPhase,
} from '@microservices/database';
import { ServerTaskRegister } from '@shared/tasks-registry';
import {
  type AppNode,
  type Environment,
  type ExecutionPhaseWithDatesInsteadOfProtoTimestamp,
  type ServerSaveEdge,
  WorkflowExecutionStatus,
} from '@shared/types';
import { createLogCollector } from './create-workflow-log-collector';
import { decrementUserCredits } from './decrement-user-credits';
import { executePhase } from './execute-phase';
import { finalizeExecutionPhase } from './finalize-execution-phase';
import { setupPhaseEnvironment } from './setup-phase-environment';

export async function executeWorkflowPhase(
  database: DrizzleDatabase,
  phase: ExecutionPhaseWithDatesInsteadOfProtoTimestamp | undefined,
  environment: Environment,
  edges: ServerSaveEdge[],
  userId: number,
) {
  if (!phase?.node) {
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
    inputs: JSON.stringify(environment.phases[node.id]?.inputs),
    outputs: JSON.stringify(environment.phases[node.id]?.outputs),
  };

  const [updatedPhase] = await database
    .update(executionPhase)
    .set(updatedPhaseData)
    .where(eq(executionPhase.id, phase.id))
    .returning();

  if (!updatedPhase) {
    throw new Error('Failed to update phase-executors');
  }

  // Decrement user balance
  const creditsRequired = ServerTaskRegister[node.data.type].credits;
  let success: boolean | typeof WorkflowExecutionStatus.WAITING_FOR_APPROVAL =
    await decrementUserCredits(database, userId, creditsRequired, logCollector);
  const creditsConsumed = success ? creditsRequired : 0;

  if (success) {
    // Actual execution
    success = await executePhase(
      database,
      phase,
      node,
      environment,
      logCollector,
    );
  }

  console.log('Phase executed', success);

  // Finalize phase-executors
  const outputs = environment.phases[node.id]?.outputs;
  const tempValues = environment.phases[node.id]?.temp;
  await finalizeExecutionPhase(
    database,
    phase.id,
    success,
    outputs,
    tempValues,
    logCollector,
    creditsConsumed,
  );
  return { success, creditsConsumed };
}
