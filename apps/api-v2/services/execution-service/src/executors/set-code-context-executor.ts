import { type ExecutionEnvironment } from '@repo/types';
import { type ServerSetCodeContextTaskType } from '@repo/tasks-registry';
import { components, type DrizzleDatabase, eq } from '@app/database';

export async function setCodeContextExecutor(
  environment: ExecutionEnvironment<ServerSetCodeContextTaskType>,
  database: DrizzleDatabase,
): Promise<boolean> {
  try {
    environment.log.INFO('Setting code context');

    environment.log.INFO("Fetching component's code context");
    const componentId = environment.getComponentId();
    if (!componentId) {
      environment.log.ERROR('Component ID is empty');
      environment.log.WARNING(
        "Using the code context from the environment's input",
      );
      const codeContext = environment.getInput('Code');
      if (!codeContext) {
        environment.log.ERROR('Code context is empty');
        throw new Error('Code context is empty');
      }
      environment.setCode(codeContext);
      environment.setStartingCode(codeContext);
      environment.log.SUCCESS('Code context set successfully');
      return true;
    }

    const [component] = componentId
      ? await database
          .select({
            code: components.code,
          })
          .from(components)
          .where(eq(components.id, componentId))
      : [];

    if (!component) {
      environment.log.ERROR('Component not found');
      throw new Error('Component not found');
    }

    const codeContext = component.code || environment.getInput('Code');

    if (!codeContext) {
      environment.log.ERROR('Code context is empty');
      throw new Error('Code context is empty');
    }
    environment.log.INFO('Fetched code context successfully');
    environment.setCode(codeContext);
    environment.setStartingCode(codeContext);
    environment.log.SUCCESS('Code context set successfully');
    return true;
  } catch (e) {
    const errorMesage = e instanceof Error ? e.message : JSON.stringify(e);
    environment.log.ERROR(`Error in setCodeContextExecutor: ${errorMesage}`);
    return false;
  }
}
