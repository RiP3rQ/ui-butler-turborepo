import { ExecutionEnvironment } from '@repo/types';
import { ServerCreateMDXDocsTaskType } from '@repo/tasks-registry';

export async function createMdxDocsExecutor(
  environment: ExecutionEnvironment<ServerCreateMDXDocsTaskType>,
): Promise<boolean> {
  try {
    const codeContext = environment.getInput('Code');
    if (!codeContext) {
      environment.log.ERROR('Code context is empty');
      throw new Error('Code context is empty');
    }
    environment.log.INFO('Fetched code context successfully');
    environment.setCode(codeContext);
    environment.log.SUCCESS('Code context set successfully');
    return true;
  } catch (e) {
    const errorMesage = e instanceof Error ? e.message : JSON.stringify(e);
    environment.log.ERROR(`Error in setCodeContextExecutor: ${errorMesage}`);
    return false;
  }
}
