import { ExecutionEnvironment } from '@repo/types';
import { ServerImproveStylesTaskType } from '@repo/tasks-registry';

export async function improveStylesExecutor(
  environment: ExecutionEnvironment<ServerImproveStylesTaskType>,
): Promise<boolean> {
  try {
    const codeContext = environment.getCode();
    if (!codeContext) {
      environment.log.ERROR('Code context is empty');
      throw new Error('Code context is empty');
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));

    environment.log.INFO('Improving styles...');
    console.log('Improving styles...');
    environment.log.SUCCESS('Styles improved successfully');
    return true;
  } catch (e) {
    const errorMesage = e instanceof Error ? e.message : JSON.stringify(e);
    environment.log.ERROR(`Error in improveStylesExecutor: ${errorMesage}`);
    return false;
  }
}
