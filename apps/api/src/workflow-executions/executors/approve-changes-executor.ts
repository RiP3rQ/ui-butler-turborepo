import { ExecutionEnvironment } from '@repo/types';
import { ServerApproveChangesTaskType } from '@repo/tasks-registry';

export async function approveChangesExecutor(
  environment: ExecutionEnvironment<ServerApproveChangesTaskType>,
): Promise<boolean> {
  try {
    const codeContext = environment.getCode();
    if (!codeContext) {
      environment.log.ERROR('Code context is empty');
      throw new Error('Code context is empty');
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));

    environment.log.INFO('Approving changes...');
    environment.setCode(codeContext);
    environment.log.SUCCESS('Changes approved successfully');
    return true;
  } catch (e) {
    const errorMesage = e instanceof Error ? e.message : JSON.stringify(e);
    environment.log.ERROR(`Error in setCodeContextExecutor: ${errorMesage}`);
    return false;
  }
}
