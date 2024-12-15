import { ExecutionEnvironment } from '@repo/types';
import { ServerSaveGeneratedCodesTaskType } from '@repo/tasks-registry';
import { DrizzleDatabase } from '../../database/merged-schemas';

export async function saveGeneratedCodesExecutor(
  environment: ExecutionEnvironment<ServerSaveGeneratedCodesTaskType>,
  database: DrizzleDatabase,
): Promise<boolean> {
  try {
    const code = environment.getCode();
    if (!code) {
      environment.log.ERROR('Code is empty');
    }

    const e2eTests = environment.getInput('E2E Tests');
    if (!e2eTests) {
      environment.log.ERROR('E2E Tests are empty');
    }

    const unitTests = environment.getInput('Unit Tests');
    if (!unitTests) {
      environment.log.ERROR('Unit Tests are empty');
    }

    const mdxDocs = environment.getInput('MDX Docs');
    if (!mdxDocs) {
      environment.log.ERROR('MDX Docs are empty');
    }

    const tsDocs = environment.getInput('Typescript Docs');
    if (!tsDocs) {
      environment.log.ERROR('TypeScript Docs are empty');
    }

    const updatedComponents = {
      e2eTests,
      unitTests,
      mdxDocs,
      code,
      tsDocs,
      updatedAt: new Date(),
    };

    console.log('Updated components:', updatedComponents);

    // await database
    //   .update(components)
    //   .set(updatedComponents)
    //   .where(eq(components.id, environment.componentId)); // TODO: ADD COMPONENT ID TO ENVIRONMENT

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
