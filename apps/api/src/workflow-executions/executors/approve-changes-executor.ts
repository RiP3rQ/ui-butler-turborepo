import { ExecutionEnvironment } from '@repo/types';
import { ServerApproveChangesTaskType } from '@repo/tasks-registry';
import { pauseResumeWorkflowExecution } from '../helpers/pause-resume-workflow-execution';
import { DrizzleDatabase } from '../../database/merged-schemas';

export async function approveChangesExecutor(
  environment: ExecutionEnvironment<ServerApproveChangesTaskType>,
  database: DrizzleDatabase,
  workflowExecutionId: number,
): Promise<boolean> {
  try {
    const codeContext = environment.getCode();
    if (!codeContext) {
      environment.log.ERROR('Code context is empty');
      throw new Error('Code context is empty');
    }

    const originalCodeContext = environment.getStartingCode();
    if (!originalCodeContext) {
      environment.log.ERROR('Original code context is empty');
      throw new Error('Original code context is empty');
    }

    environment.log.INFO('Waiting for user approval...');

    // Store the current code state
    environment.setOutput('Original code', originalCodeContext);
    environment.setOutput('Pending code', codeContext);

    // Pause the workflow execution
    await pauseResumeWorkflowExecution(workflowExecutionId, database);

    // Return false to stop the execution
    // The execution will be resumed later when user approves/rejects
    return false;
  } catch (e) {
    const errorMesage = e instanceof Error ? e.message : JSON.stringify(e);
    environment.log.ERROR(`Error in approveChangesExecutor: ${errorMesage}`);
    return false;
  }
}
