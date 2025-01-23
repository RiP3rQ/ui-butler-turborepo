import {
  type DrizzleDatabase,
  eq,
  executionLog,
  executionPhase,
} from '@microservices/database';
import { NotFoundException } from '@nestjs/common';
import {
  ExecutionPhaseStatus,
  type LogCollector,
  WorkflowExecutionStatus,
} from '@shared/types';

export async function finalizeExecutionPhase(
  database: DrizzleDatabase,
  phaseId: number,
  success:
    | boolean
    | typeof WorkflowExecutionStatus.WAITING_FOR_APPROVAL
    | undefined,
  outputs: Record<string, string> | undefined,
  tempValues: Record<string, string> | undefined,
  logCollector: LogCollector,
  creditsConsumed: number,
) {
  if (!phaseId || success === undefined) {
    throw new Error('Phase ID and success status are required');
  }

  console.log('Finalizing phase', phaseId, success);

  const finalStatus =
    // eslint-disable-next-line no-nested-ternary --- Thats fine chill eslint
    success === WorkflowExecutionStatus.WAITING_FOR_APPROVAL
      ? ExecutionPhaseStatus.WAITING_FOR_APPROVAL
      : success
        ? ExecutionPhaseStatus.COMPLETED
        : ExecutionPhaseStatus.FAILED;

  const workflowExecutionData = {
    status: finalStatus,
    completedAt: new Date(),
    outputs: JSON.stringify(outputs),
    temp: JSON.stringify(tempValues),
    creditsCost: creditsConsumed,
  };

  // Finalize the phase-executors with the updated status
  await database.transaction(async (tx) => {
    try {
      // Update the phase status
      const [updatedPhase] = await tx
        .update(executionPhase)
        .set(workflowExecutionData)
        .where(eq(executionPhase.id, phaseId))
        .returning();

      if (!updatedPhase) {
        throw new NotFoundException(
          `Phase with ID ${String(phaseId)} not found`,
        );
      }

      // Create logs
      const logs = logCollector.getAll();

      const executionLogsData = logs.map((log) => ({
        executionPhaseId: phaseId,
        logLevel: log.level,
        message: log.message,
        timestamp: log.timestamp,
      }));

      if (logs.length > 0) {
        await tx.insert(executionLog).values(executionLogsData).execute();
      }

      return updatedPhase;
    } catch (e) {
      console.error('Error while finalizing execution phase', e);
      logCollector.ERROR('Failed to finalize execution phase');
      tx.rollback();
    }
  });
}
