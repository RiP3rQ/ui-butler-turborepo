import { ExecutionEnvironment, WorkflowExecutionStatus } from '@shared/types';
import { ServerApproveChangesTaskType } from '@shared/tasks-registry';
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

    const componentId = environment.getComponentId();
    if (!componentId) {
      environment.log.WARNING('Component ID is empty');
    }

    // Save the original code context to the database
    environment.setTemp('Original code', originalCodeContext);
    environment.setTemp('Pending code', codeContext);
    environment.setTemp('Component ID', String(componentId));

    console.dir(originalCodeContext, { depth: null, colors: true });
    console.dir(codeContext, { depth: null, colors: true });

    // Set output to code context
    environment.setOutput('Code', codeContext);

    // Pause the workflow execution
    await pauseWorkflowExecution(workflowExecutionId, database);

    environment.log.SUCCESS('Successfully paused the workflow execution');

    // Return false to stop the execution
    // The execution will be resumed later when user approves/rejects
    return WorkflowExecutionStatus.WAITING_FOR_APPROVAL;
  } catch (e) {
    const errorMesage = e instanceof Error ? e.message : JSON.stringify(e);
    environment.log.ERROR(`Error in approveChangesExecutor: ${errorMesage}`);
    return false;
  }
}
