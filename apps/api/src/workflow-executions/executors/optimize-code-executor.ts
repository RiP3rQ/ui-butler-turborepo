import { ExecutionEnvironment } from '@repo/types';
import { ServerOptimizeCodeTaskType } from '@repo/tasks-registry';

export async function optimizeCodeExecutor(
  environment: ExecutionEnvironment<ServerOptimizeCodeTaskType>,
): Promise<boolean> {
  try {
    const codeContext = environment.getCode();
    if (!codeContext) {
      environment.log.ERROR('Code context is empty');
      throw new Error('Code context is empty');
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));

    environment.log.INFO('Optimizing code...');
    console.log('Optimizing code...');
    environment.log.SUCCESS('Code optimized successfully');
    return true;
  } catch (e) {
    const errorMesage = e instanceof Error ? e.message : JSON.stringify(e);
    environment.log.ERROR(`Error in optimizeCodeExecutor: ${errorMesage}`);
    return false;
  }
}
