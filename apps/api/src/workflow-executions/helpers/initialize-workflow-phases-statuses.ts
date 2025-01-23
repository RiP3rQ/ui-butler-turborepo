import { ExecutionPhase, ExecutionPhaseStatus } from '@shared/types';
import { DrizzleDatabase } from '../../database/merged-schemas';
import { executionPhase } from '../../database/schemas/workflow-executions';
import { inArray } from 'drizzle-orm/sql/expressions/conditions';

export async function initializeWorkflowPhasesStatuses(
  database: DrizzleDatabase,
  phases: ExecutionPhase[],
) {
  if (!phases || phases.length === 0) {
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
