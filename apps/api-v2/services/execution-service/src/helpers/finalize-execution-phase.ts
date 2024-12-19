import {
  ExecutionPhaseStatus,
  LogCollector,
  WorkflowExecutionStatus,
} from '@repo/types';
import { eq } from 'drizzle-orm';
import { NotFoundException } from '@nestjs/common';
import { DrizzleDatabase, executionLog, executionPhase } from '@app/database';

export async function finalizeExecutionPhase(
  database: DrizzleDatabase,
  phaseId: number,
  success: boolean | typeof WorkflowExecutionStatus.WAITING_FOR_APPROVAL,
  outputs: Record<string, string>,
  tempValues: Record<string, string>,
  logCollector: LogCollector,
  creditsConsumed: number,
) {
  if (!phaseId || success === undefined) {
    throw new Error('Phase ID and success status are required');
  }

  console.log('Finalizing phase', phaseId, success);

  const finalStatus =
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
        throw new NotFoundException(`Phase with ID ${phaseId} not found`);
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
