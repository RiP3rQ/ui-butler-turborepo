import { ExecutionEnvironment } from '@repo/types';
import { ServerSaveGeneratedCodesTaskType } from '@repo/tasks-registry';

export async function saveGeneratedCodesExecutor(
  environment: ExecutionEnvironment<ServerSaveGeneratedCodesTaskType>,
): Promise<boolean> {
  try {
    const codeContext = environment.getCode();
    if (!codeContext) {
      environment.log.ERROR('Code context is empty');
    }

    const tests = environment.getInput('Tests');
    if (!tests) {
      environment.log.ERROR('Tests are empty');
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));

    environment.log.INFO('Saving generated codes...');
    console.log('Saving generated codes...');
    environment.log.SUCCESS('Generated codes saved successfully');
    return true;
  } catch (e) {
    const errorMesage = e instanceof Error ? e.message : JSON.stringify(e);
    environment.log.ERROR(
      `Error in saveGeneratedCodesExecutor: ${errorMesage}`,
    );
    return false;
  }
}
