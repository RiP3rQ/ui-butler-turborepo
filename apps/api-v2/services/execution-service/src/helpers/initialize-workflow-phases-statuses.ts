import { type ExecutionPhase, ExecutionPhaseStatus } from '@repo/types';
import { type DrizzleDatabase, executionPhase, inArray } from '@app/database';

export async function initializeWorkflowPhasesStatuses(
  database: DrizzleDatabase,
  phases: ExecutionPhase[],
) {
  if (phases.length === 0) {
    return;
  }

  // Set status of all phase-executors to PENDING because we are not executing them yet
  const results = await database
    .update(executionPhase)
    .set({
      status: ExecutionPhaseStatus.PENDING,
    })
    .where(
      inArray(
        executionPhase.id,
        phases.map((phase) => phase.id),
      ),
    )
    .returning();

  if (results.length !== phases.length || results.length === 0) {
    throw new Error('Failed to initialize phase statuses');
  }
}
