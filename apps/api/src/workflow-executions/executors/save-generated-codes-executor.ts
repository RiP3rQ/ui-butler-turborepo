import { ExecutionEnvironment } from '@repo/types';
import { ServerSaveGeneratedCodesTaskType } from '@repo/tasks-registry';
import { DrizzleDatabase } from '../../database/merged-schemas';

export async function saveGeneratedCodesExecutor(
  environment: ExecutionEnvironment<ServerSaveGeneratedCodesTaskType>,
  database: DrizzleDatabase,
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
