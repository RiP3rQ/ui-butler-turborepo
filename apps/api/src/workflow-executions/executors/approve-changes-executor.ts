import { ExecutionEnvironment, WorkflowExecutionStatus } from '@repo/types';
import { ServerApproveChangesTaskType } from '@repo/tasks-registry';
import { pauseWorkflowExecution } from '../helpers/pause-workflow-execution';
import { DrizzleDatabase } from '../../database/merged-schemas';

export async function approveChangesExecutor(
  environment: ExecutionEnvironment<ServerApproveChangesTaskType>,
  database: DrizzleDatabase,
  workflowExecutionId: number,
): Promise<boolean | typeof WorkflowExecutionStatus.WAITING_FOR_APPROVAL> {
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

    // Save the original code context to the database
    environment.setTemp('Original code', originalCodeContext);
    environment.setTemp('Pending code', codeContext);

    // Set output to code context
    environment.setOutput('Code', codeContext);

    // Pause the workflow execution
    await pauseWorkflowExecution(workflowExecutionId, database);

    // Return false to stop the execution
    // The execution will be resumed later when user approves/rejects
    return WorkflowExecutionStatus.WAITING_FOR_APPROVAL;
  } catch (e) {
    const errorMesage = e instanceof Error ? e.message : JSON.stringify(e);
    environment.log.ERROR(`Error in approveChangesExecutor: ${errorMesage}`);
    return false;
  }
}
