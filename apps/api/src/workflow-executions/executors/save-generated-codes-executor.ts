import { ExecutionEnvironment } from '@shared/types';
import { ServerSaveGeneratedCodesTaskType } from '@shared/tasks-registry';
import { DrizzleDatabase } from '../../database/merged-schemas';
import { components } from '../../database/schemas/components';
import { eq } from 'drizzle-orm';

export async function saveGeneratedCodesExecutor(
  environment: ExecutionEnvironment<ServerSaveGeneratedCodesTaskType>,
  database: DrizzleDatabase,
): Promise<boolean> {
  try {
    const code = environment.getCode();
    if (!code) {
      environment.log.ERROR('Code is empty');
    }

    const e2eTests = environment.getE2ETests();
    if (!e2eTests) {
      environment.log.ERROR('E2E Tests are empty');
    }

    const unitTests = environment.getUnitTests();
    if (!unitTests) {
      environment.log.ERROR('Unit Tests are empty');
    }

    const mdxDocs = environment.getMdxDocs();
    if (!mdxDocs) {
      environment.log.ERROR('MDX Docs are empty');
    }

    const tsDocs = environment.getTsDocs();
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

    const componentId = environment.getComponentId();
    if (!componentId) {
      environment.log.ERROR('Component ID is missing');
    }

    console.log('Updated components:', updatedComponents);

    environment.log.INFO('Saving generated codes...');
    console.log('Saving generated codes...');

    const [component] = await database
      .update(components)
      .set(updatedComponents)
      .where(eq(components.id, componentId))
      .returning();

    if (!component) {
      environment.log.ERROR('Component not found');
      throw new Error('Component not found');
    }

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
